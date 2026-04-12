import { useState } from "react";
import { useSampleLibraryNavigation } from "./hooks/useSampleLibraryNavigation";
import {
  type Track,
  type Stack,
  type SamplerZone,
  type NoteName,
  NOTE_NAMES,
} from "@/types";
import type { Sample } from "./hooks/useSampleLibrary";
import { useAudioPreview } from "./hooks/useAudioPreview";
import {
  useAvailableBpms,
  useSampleCollections,
  useSamples,
  useSampleSubcategories,
} from "./hooks/useSampleLibrary";
import { LibraryCollectionsView } from "./LibraryCollectionsView";
import { LibraryToolbar } from "./LibraryToolbar";
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
  // samplerTrack is no longer needed here
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
  const { storeAddTrack } = useTracksStore(); // storeUpdateTrack removed

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
  const updateZonesMutation = useMutation(
    trpc.sampler.updateSample.mutationOptions(),
  );

  if (!userId) return null;

  const handleAction = async (sample: Sample) => {
    const sampleId = sample.id;
    setLoadingFiles((prev) => ({ ...prev, [sampleId]: true }));

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const mode = searchParams.get("mode");
      const returnTo = searchParams.get("returnTo");
      const lowNoteParam = searchParams.get("lowNote");
      const highNoteParam = searchParams.get("highNote");

      // ZONE CREATION FLOW - Return to sampler with sample + range
      if (returnTo === "sampler-zone" && lowNoteParam && highNoteParam) {
        const lowIndex = NOTE_NAMES.indexOf(lowNoteParam as NoteName);
        const highIndex = NOTE_NAMES.indexOf(highNoteParam as NoteName);

        const finalLowNote =
          lowIndex < highIndex
            ? (lowNoteParam as NoteName)
            : (highNoteParam as NoteName);

        const finalHighNote =
          lowIndex < highIndex
            ? (highNoteParam as NoteName)
            : (lowNoteParam as NoteName);

        navigate({
          to: "/stacks/$stackId/sampler/$trackId",
          params: { stackId: stack.id, trackId },
          search: {
            returnTo: "sampler-zone",
            sampleUrl: sample.downloadUrl,
            lowNote: finalLowNote,
            highNote: finalHighNote,
          },
          replace: true,
        });

        return;
      }

      // CREATE NEW SAMPLER TRACK
      else if (trackId === "new" && mode === "sampler") {
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

        const defaultZone: SamplerZone = {
          id: crypto.randomUUID(),
          sampleUrl: sample.downloadUrl,
          lowNote: "C1",
          highNote: "B5",
          rootNote: "C4",
        };

        await updateZonesMutation.mutateAsync({
          trackId: created.id,
          zones: [defaultZone],
        });

        const newTrack: Track = {
          ...baseTrack,
          id: created.id,
          stackId: stack.id,
          createdAt: created.createdAt ?? new Date().toISOString(),
          updatedAt: created.updatedAt ?? new Date().toISOString(),
          samplerTrack: {
            pattern: [],
            attackMs: 10,
            releaseMs: 200,
            zones: [defaultZone],
          },
        };

        storeAddTrack(newTrack);

        navigate({
          to: "/stacks/$stackId/sampler/$trackId",
          params: { stackId: stack.id, trackId: created.id },
        });
      }
      // NORMAL LOAD TRACK
      else {
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
          <LibraryToolbar
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
          <LibraryToolbar
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
