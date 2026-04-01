import type { SampleLibraryNavigation } from "@/types";
import { toTitleCase } from "../utils/string-utils";

type LibraryHeaderProps = {
  navigation: SampleLibraryNavigation;
  search: string;
  onSearchChange: (value: string) => void;
  bpmFilter: number | null;
  onBpmFilterChange: (value: number | null) => void;
  availableBpms: number[];
};

export const LibraryHeader = ({
  navigation,
  search,
  onSearchChange,
  bpmFilter,
  onBpmFilterChange,
  availableBpms,
}: LibraryHeaderProps) => {
  const isInSubcategory = !!navigation.currentSubcategory;

  const displayCollection = navigation.currentCollection
    ? toTitleCase(navigation.currentCollection)
    : "";

  const displaySubcategory = navigation.currentSubcategory
    ? toTitleCase(navigation.currentSubcategory)
    : "";

  return (
    <div className="h-14 flex items-center px-4 border-b border-neutral-800 gap-4 relative z-10">
      <div className="flex items-center gap-2 text-sm font-medium min-w-0 flex-1">
        <button
          onClick={navigation.goBack}
          className="text-gray-400 hover:text-white transition-colors cursor-pointer mr-1 flex-shrink-0"
          title="Back to all collections"
        >
          ←
        </button>

        <span
          onClick={() => {
            if (navigation.currentCollection) {
              navigation.goToCollection(navigation.currentCollection);
            }
          }}
          className="text-gray-400 hover:text-white cursor-pointer transition-colors truncate"
        >
          {displayCollection}
        </span>

        {isInSubcategory && (
          <>
            <span className="text-gray-600 mx-1 flex-shrink-0">/</span>
            <span className="text-gray-300 truncate">{displaySubcategory}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-4 flex-shrink-0 pr-10">
        <div className="w-60">
          <input
            type="text"
            placeholder="Search filename..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-neutral-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 whitespace-nowrap">BPM</span>
          <select
            value={bpmFilter ?? ""}
            onChange={(e) =>
              onBpmFilterChange(
                e.target.value ? parseInt(e.target.value) : null,
              )
            }
            className="bg-neutral-900 border border-neutral-700 text-sm rounded px-3 py-1 focus:outline-none focus:border-neutral-600 min-w-[70px]"
          >
            <option value="">All</option>
            {availableBpms.map((bpm) => (
              <option key={bpm} value={bpm}>
                {bpm}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
