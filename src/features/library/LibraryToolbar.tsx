import type { SampleLibraryNavigation } from "@/types";
import { toTitleCase } from "../utils/string-utils";
import { useNavigate } from "@tanstack/react-router";
import useStackIdStore from "../stacks/hooks/useStackIdStore";
import { ChevronDown } from "lucide-react";

type LibraryToolbarProps = {
  navigation: SampleLibraryNavigation;
  search: string;
  onSearchChange: (value: string) => void;
  bpmFilter: number | null;
  onBpmFilterChange: (value: number | null) => void;
  availableBpms: number[];
  showSearchAndBpm?: boolean;
};

export const LibraryToolbar = ({
  navigation,
  search,
  onSearchChange,
  bpmFilter,
  onBpmFilterChange,
  availableBpms,
  showSearchAndBpm = true,
}: LibraryToolbarProps) => {
  const navigate = useNavigate();
  const stackId = useStackIdStore((state) => state.stackId);

  const handleBackToGrid = () => {
    if (stackId) {
      navigate({
        to: "/stacks/$stackId",
        params: { stackId },
        search: { page: 0 },
        replace: true,
      });
    }
  };

  const handleBack = () => {
    if (navigation.currentCollection) {
      navigation.goBack();
    } else {
      handleBackToGrid();
    }
  };

  const isInSubcategory = !!navigation.currentSubcategory;

  const displayCollection = navigation.currentCollection
    ? toTitleCase(navigation.currentCollection)
    : "";

  const displaySubcategory = navigation.currentSubcategory
    ? toTitleCase(navigation.currentSubcategory)
    : "";

  return (
    <div className="h-10 flex items-center px-4 border-neutral-800 gap-4 bg-neutral-950">
      {/* Left side - Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-medium min-w-0 flex-1">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors cursor-pointer h-9 px-3 rounded hover:bg-neutral-900 flex-shrink-0"
          title="Go back"
        >
          ←
        </button>

        <span
          onClick={() => {
            if (navigation.currentCollection) {
              navigation.goToCollection(navigation.currentCollection);
            }
          }}
          className="text-neutral-400 hover:text-white cursor-pointer transition-colors truncate"
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

      {showSearchAndBpm && (
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Search Input - height matched to select without changing the select */}
          <div className="w-60">
            <input
              type="text"
              placeholder="Search filename..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-3  text-sm 
                         focus:outline-none focus:border-neutral-600 
                         hover:border-neutral-600 transition-colors
                         box-border leading-none h-[28px]"
            />
          </div>

          {/* BPM Select - UNCHANGED (exactly as before) */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-400 whitespace-nowrap">BPM</span>

            <div className="relative">
              <select
                value={bpmFilter ?? ""}
                onChange={(e) =>
                  onBpmFilterChange(
                    e.target.value ? parseInt(e.target.value) : null,
                  )
                }
                className="bg-neutral-900 border border-neutral-700 text-sm rounded px-3 py-0.75 
                           focus:outline-none focus:border-neutral-600 
                           hover:border-neutral-600 transition-colors
                           appearance-none cursor-pointer min-w-[70px]"
              >
                <option value="">All</option>
                {availableBpms.map((bpm) => (
                  <option key={bpm} value={bpm}>
                    {bpm}
                  </option>
                ))}
              </select>

              {/* Custom Chevron */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};