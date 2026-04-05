import { useState } from "react";
import { useSampleLibraryNavigation } from "./hooks/useSampleLibraryNavigation";
import type { Track, Stack } from "@/types";
import type { Sample } from "./hooks/useSampleLibrary";
import { useAudioPreview } from "./hooks/useAudioPreview";
import {
  useAvailableBpms,
  useSampleCollections,
  useSamples,
  useSampleSubcategories,
} from "./hooks/useSampleLibrary";
import { LibraryCollectionsView } from "./LibraryCollectionsView";
import { LibraryHeader } from "./LibraryHeader";
import { LibrarySubcategoriesView } from "./LibrarySubcategoriesView";
import { LibraryContent } from "./LibraryContent";
import { useLoadTrack } from "../track/hooks/useLoadTrack";
import { trpc } from "@/trpc";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import useTracksStore from "../track/hooks/useTracksStore";
import { createNewTrack } from "../utils/track-utils";

type TrackLibraryProps = {
  userId: string | null;
  tracks: Track[];
  stack: Stack;
  trackId: string;
};

export const TrackLibrary = ({
  userId,
  tracks,
  stack,
  trackId,
}: TrackLibraryProps) => {
  const navigation = useSampleLibraryNavigation();
  const preview = useAudioPreview();
  const { loadTrack } = useLoadTrack(tracks, stack);
  const navigate = useNavigate();
  const { storeAddTrack } = useTracksStore();

  const [loadingFiles, setLoadingFiles] = useState<Record<string, boolean>>({});
  const [bpmFilter, setBpmFilter] = useState<number | null>(null);
  const [search, setSearch] = useState<string>("");

  const collectionsQuery = useSampleCollections();
  const subcategoriesQuery = useSampleSubcategories(
    navigation.currentCollection,
  );
  const availableBpmsQuery = useAvailableBpms(
    navigation.currentCollection,
    navigation.currentSubcategory,
  );
  const samplesQuery = useSamples(
    navigation.currentCollection,
    navigation.currentSubcategory,
    bpmFilter,
    search,
  );

  const createSamplerMutation = useMutation(
    trpc.track.create.mutationOptions(),
  );
  const updateSamplerSampleMutation = useMutation(
    trpc.sampler.updateSample.mutationOptions(),
  );

  if (!userId) return null;

  const handleAction = async (sample: Sample) => {
    const sampleId = sample.id;
    setLoadingFiles((prev) => ({ ...prev, [sampleId]: true }));

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const isNewSampler =
        trackId === "new" && searchParams.get("type") === "sampler";

      if (isNewSampler) {
        const baseTrack = createNewTrack(
          null,
          null,
          tracks,
          stack,
          undefined,
          true,
        );
        const created = await createSamplerMutation.mutateAsync({
          stackId: stack.id,
          type: "sampler",
          label: baseTrack.label,
          color: baseTrack.color,
        });

        await updateSamplerSampleMutation.mutateAsync({
          trackId: created.id,
          sampleUrl: sample.downloadUrl,
        });

        const newTrack: Track = {
          ...created,
          type: "sampler" as const,
          audioTrack: null,
          samplerTrack: {
            pattern: [],
            sampleUrl: sample.downloadUrl,
          },
        };

        storeAddTrack(newTrack);

        navigate({
          to: "/stacks/$stackId/sampler/$trackId",
          params: { stackId: stack.id, trackId: created.id },
        });
      } else {
        await loadTrack(sample);
      }
    } catch (error) {
      console.error("Failed to load sample:", error);
    } finally {
      setLoadingFiles((prev) => ({ ...prev, [sampleId]: false }));
    }
  };

  if (collectionsQuery.isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-neutral-950">
        <div className="animate-spin h-8 w-8 border-4 border-neutral-700 border-t-white rounded-full mb-4" />
        <p className="text-neutral-400">Loading sample library...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {!navigation.currentCollection ? (
        <div className="flex flex-col h-full overflow-hidden">
          <LibraryHeader
            navigation={navigation}
            search={search}
            onSearchChange={setSearch}
            bpmFilter={bpmFilter}
            onBpmFilterChange={setBpmFilter}
            availableBpms={availableBpmsQuery.data ?? []}
            showSearchAndBpm={false}
          />

          <LibraryCollectionsView
            collections={collectionsQuery.data ?? []}
            onSelectCollection={navigation.goToCollection}
          />
        </div>
      ) : (
        <div className="flex flex-col h-full overflow-hidden">
          <LibraryHeader
            navigation={navigation}
            search={search}
            onSearchChange={setSearch}
            bpmFilter={bpmFilter}
            onBpmFilterChange={setBpmFilter}
            availableBpms={availableBpmsQuery.data ?? []}
          />

          <div className="flex-1 overflow-auto">
            {subcategoriesQuery.isLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="animate-spin h-6 w-6 border-4 border-neutral-700 border-t-white rounded-full" />
              </div>
            ) : subcategoriesQuery.data &&
              subcategoriesQuery.data.length > 0 &&
              !navigation.currentSubcategory ? (
              <LibrarySubcategoriesView
                subcategories={subcategoriesQuery.data}
                onSelectSubcategory={navigation.goToSubcategory}
              />
            ) : samplesQuery.isLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="animate-spin h-6 w-6 border-4 border-neutral-700 border-t-white rounded-full" />
              </div>
            ) : (
              <LibraryContent
                subcategories={subcategoriesQuery.data ?? []}
                samples={samplesQuery.data ?? []}
                currentSubcategory={navigation.currentSubcategory}
                onSelectSubcategory={navigation.goToSubcategory}
                preview={preview}
                loadingFiles={loadingFiles}
                onLoadTrack={handleAction}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackLibrary;
