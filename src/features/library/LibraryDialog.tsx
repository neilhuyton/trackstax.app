import { useState } from "react";

import {
  useSampleCollections,
  useSampleSubcategories,
  useSamples,
  useAvailableBpms,
  type Sample,
} from "../track/hooks/useSampleLibrary";

import { useSampleLibraryNavigation } from "./hooks/useSampleLibraryNavigation";
import { useAudioPreview } from "../track/hooks/useAudioPreview";
import { useLoadTrack } from "../track/hooks/useLoadTrack";

import type { Track, Stack } from "@/types";
import { LibraryCollectionsView } from "./LibraryCollectionsView";
import { LibraryHeader } from "./LibraryHeader";
import { LibraryContent } from "../track/LibraryContent";
import { LibrarySubcategoriesView } from "../track/LibrarySubcategoriesView";

type TrackLibraryDialogProps = {
  userId: string | null;
  tracks: Track[];
  stack: Stack;
};

export const TrackLibraryDialog = ({
  userId,
  tracks,
  stack,
}: TrackLibraryDialogProps) => {
  const navigation = useSampleLibraryNavigation();
  const preview = useAudioPreview();
  const { loadTrack } = useLoadTrack(tracks, stack);

  const [loadingFiles, setLoadingFiles] = useState<Record<string, boolean>>({});
  const [bpmFilter, setBpmFilter] = useState<number | null>(null);
  const [search, setSearch] = useState<string>("");

  // Queries
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

  if (!userId) return null;

  const handleLoadTrack = async (sample: Sample) => {
    const sampleId = sample.id;
    setLoadingFiles((prev) => ({ ...prev, [sampleId]: true }));

    try {
      await loadTrack(sample);
    } catch (error) {
      console.error("Failed to load track:", error);
    } finally {
      setLoadingFiles((prev) => ({ ...prev, [sampleId]: false }));
    }
  };

  // Show global loading state while initial collections are fetching
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
        // Collections Grid
        <LibraryCollectionsView
          collections={collectionsQuery.data ?? []}
          onSelectCollection={navigation.goToCollection}
        />
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
                onLoadTrack={handleLoadTrack}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackLibraryDialog;
