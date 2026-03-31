import type { SampleLibraryNavigation } from "@/types";

type LibraryHeaderProps = {
  navigation: SampleLibraryNavigation;
  search: string;
  onSearchChange: (value: string) => void;
  bpmFilter: number | null;
  onBpmFilterChange: (value: number | null) => void;
};

export const LibraryHeader = ({
  navigation,
  search,
  onSearchChange,
  bpmFilter,
  onBpmFilterChange,
}: LibraryHeaderProps) => {
  return (
    <div className="h-14 flex items-center px-4 border-b border-neutral-800 gap-4">
      <button
        onClick={navigation.goBack}
        className="h-7 px-3 text-sm -ml-1 hover:bg-neutral-800 rounded"
      >
        ← Back
      </button>

      <div className="text-sm text-gray-400 flex-1 truncate font-medium">
        {navigation.currentCollection}
        {navigation.currentSubcategory && ` / ${navigation.currentSubcategory}`}
      </div>

      {/* Search Box */}
      <div className="w-60">
        <input
          type="text"
          placeholder="Search filename..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-neutral-600"
        />
      </div>

      {/* BPM Filter */}
      <div className="flex items-center gap-2 mr-8">
        <span className="text-xs text-gray-500">BPM</span>
        <select
          value={bpmFilter ?? ""}
          onChange={(e) =>
            onBpmFilterChange(e.target.value ? parseInt(e.target.value) : null)
          }
          className="bg-neutral-900 border border-neutral-700 text-sm rounded px-3 py-1 focus:outline-none focus:border-neutral-600"
        >
          <option value="">All</option>
          <option value="120">120</option>
          <option value="124">124</option>
          <option value="128">128</option>
          <option value="130">130</option>
          <option value="133">133</option>
          <option value="135">135</option>
          <option value="140">140</option>
        </select>
      </div>
    </div>
  );
};
