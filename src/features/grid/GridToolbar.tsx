import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useGridAutoPage } from "./hooks/useGridAutoPage";
import { useGridEndStop } from "./hooks/useGridEndStop";

const GridToolbar = () => {
  const navigate = useNavigate();
  const { page = 0 } = useSearch({ from: "/_authenticated/stacks/$stackId/" });

  const totalBars = 32;

  const pageSize = 8;
  const totalPages = Math.ceil(totalBars / pageSize);
  const currentPage = Math.max(0, Math.min(page, totalPages - 1));

  const startBar = currentPage * pageSize + 1;
  const endBar = Math.min((currentPage + 1) * pageSize, totalBars);

  const canGoPrev = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;

  useGridEndStop(totalBars);
  useGridAutoPage(totalBars);

  const goToPage = (newPage: number) => {
    const clamped = Math.max(0, Math.min(newPage, totalPages - 1));

    navigate({
      to: ".",
      search: { page: clamped },
      replace: true,
    });
  };

  const goToFirstPage = () => goToPage(0);
  const goToPrevPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);
  const goToLastPage = () => goToPage(totalPages - 1);

  const handleBack = () => {
    navigate({
      to: "/stacks",
      replace: true,
    });
  };

  return (
    <div className="h-10 flex items-center px-4 border-neutral-800 bg-neutral-950">
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mr-8 px-1 text-sm font-medium"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="font-medium">Back to Stacks</span>
        </button>

        <button
          onClick={goToFirstPage}
          disabled={!canGoPrev}
          className="ml-auto px-4 py-0.75 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded text-sm text-white transition-colors"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        <button
          onClick={goToPrevPage}
          disabled={!canGoPrev}
          className="px-4 py-0.75 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded text-sm text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-sm text-neutral-400 min-w-[140px] text-center">
          Bars <span className="text-white font-medium">{startBar}</span>–
          {endBar} of {totalBars}
        </div>

        <button
          onClick={goToNextPage}
          disabled={!canGoNext}
          className="px-4 py-0.75 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded text-sm text-white transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={goToLastPage}
          disabled={!canGoNext}
          className="px-4 py-0.75 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded text-sm text-white transition-colors"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default GridToolbar;
