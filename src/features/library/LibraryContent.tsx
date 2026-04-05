import type { Sample } from "./hooks/useSampleLibrary";
import { LibrarySubcategoriesView } from "./LibrarySubcategoriesView";
import { SampleTableRow } from "./SampleTableRow";
import type { useAudioPreview } from "./hooks/useAudioPreview";

type LibraryContentProps = {
  subcategories: string[];
  samples: Sample[];
  currentSubcategory: string | null;
  onSelectSubcategory: (subcategory: string) => void;
  preview: ReturnType<typeof useAudioPreview>;
  loadingFiles: Record<string, boolean>;
  onLoadTrack: (sample: Sample) => Promise<void> | void;
};

export const LibraryContent = ({
  subcategories,
  samples,
  currentSubcategory,
  onSelectSubcategory,
  preview,
  loadingFiles,
  onLoadTrack,
}: LibraryContentProps) => {
  if (subcategories.length > 0 && !currentSubcategory) {
    return (
      <LibrarySubcategoriesView
        subcategories={subcategories}
        onSelectSubcategory={onSelectSubcategory}
      />
    );
  }

  return (
    <table className="w-full text-sm">
      <thead className="sticky top-0 bg-neutral-950 border-b border-neutral-700 z-20">
        <tr className="h-8">
          <th className="w-10 py-1 px-3"></th>
          <th className="text-left py-1 px-3 font-medium text-gray-400 text-xs">
            Filename
          </th>
          <th className="w-16 text-center py-1 px-3 font-medium text-gray-400 text-xs">
            BPM
          </th>
          <th className="w-20 text-center py-1 px-3 font-medium text-gray-400 text-xs">
            Key
          </th>
          <th className="w-20 py-1 px-3"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-neutral-800">
        {samples.map((sample) => (
          <SampleTableRow
            key={sample.id}
            sample={sample}
            isPlaying={preview.playingId === sample.id}
            isLoading={loadingFiles[sample.id] || false}
            onTogglePreview={preview.togglePreview}
            onLoadTrack={onLoadTrack}
          />
        ))}
      </tbody>
    </table>
  );
};
