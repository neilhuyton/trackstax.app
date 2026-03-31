import { useState } from "react";

import {
  useSampleCollections,
  useSampleSubcategories,
  useSamples,
  type Sample,
} from "./hooks/useSampleLibrary";
import { useSampleLibraryNavigation } from "./hooks/useSampleLibraryNavigation";
import { useAudioPreview } from "./hooks/useAudioPreview";
import { useLoadTrack } from "./hooks/useLoadTrack";

import type { Track, Stack } from "@/types";
import { LibraryCollectionsView } from "./LibraryCollectionsView";
import { LibraryHeader } from "./LibraryHeader";
import { LibraryContent } from "./LibraryContent";

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

  const { data: collections = [] } = useSampleCollections();
  const { data: subcategories = [] } = useSampleSubcategories(
    navigation.currentCollection,
  );
  const { data: samples = [] } = useSamples(
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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {!navigation.currentCollection ? (
        <LibraryCollectionsView
          collections={collections}
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
          />

          <div className="flex-1 overflow-auto">
            <LibraryContent
              subcategories={subcategories}
              samples={samples}
              currentSubcategory={navigation.currentSubcategory}
              onSelectSubcategory={navigation.goToSubcategory}
              preview={preview}
              loadingFiles={loadingFiles}
              onLoadTrack={handleLoadTrack}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackLibraryDialog;
