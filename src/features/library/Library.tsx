import { useState } from "react";
import { useSampleLibraryNavigation } from "./hooks/useSampleLibraryNavigation";
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

type TrackLibraryProps = {
  userId: string | null;
  onSampleSelected: (sample: Sample) => void | Promise<void>;
};

export const TrackLibrary = ({
  userId,
  onSampleSelected,
}: TrackLibraryProps) => {
  const navigation = useSampleLibraryNavigation();
  const preview = useAudioPreview();

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

  if (!userId) return null;

  const handleSelectSample = (sample: Sample) => {
    const sampleId = sample.id;
    setLoadingFiles((prev) => ({ ...prev, [sampleId]: true }));

    Promise.resolve(onSampleSelected(sample))
      .catch((error) => {
        console.error("Failed to handle selected sample:", error);
      })
      .finally(() => {
        setLoadingFiles((prev) => ({ ...prev, [sampleId]: false }));
      });
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
                onLoadTrack={handleSelectSample}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackLibrary;
