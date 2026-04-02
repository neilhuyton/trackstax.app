import { createFileRoute } from "@tanstack/react-router";
import GridContainer from "@/features/grid/GridContainer";
import { TrackListSheet } from "@/features/track/TrackListSheet";
import { TrackToolsSheet } from "@/features/track/TrackToolsSheet";

export const Route = createFileRoute("/_authenticated/stacks/$stackId/")({
  validateSearch: (search: Record<string, unknown>) => {
    const page = typeof search.page === "number" ? search.page : 0;
    return {
      page: Math.max(0, page),
    };
  },

  component: StackGridPage,
});

function StackGridPage() {
  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#1a1a1a]">
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        <TrackListSheet />
        <div className="flex-1 min-h-0 overflow-hidden">
          <GridContainer />
        </div>
        <TrackToolsSheet />
      </div>
    </div>
  );
}
