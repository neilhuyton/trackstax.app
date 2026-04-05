import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useScreen } from "../screen/hooks/useScreen";
import useStackIdStore from "../stacks/hooks/useStackIdStore";
import { useGridAutoPage } from "./hooks/useGridAutoPage";
import { useGridEndStop } from "./hooks/useGridEndStop";

const GridToolbar = () => {
  const navigate = useNavigate();
  const { page = 0 } = useSearch({ from: "/_authenticated/stacks/$stackId/" });

  const stackId = useStackIdStore((state) => state.stackId);
  const { screen } = useScreen(stackId);
  const totalBars = screen?.gridLengthInBars ?? 8;

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

  return (
    <div className="h-10 flex items-center px-4 border-b border-neutral-800 bg-neutral-950">
      <div className="flex items-center gap-3 flex-1">
        <Button
          variant="outline"
          size="sm"
          onClick={goToFirstPage}
          disabled={!canGoPrev}
          className="h-8 w-8 p-0"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrevPage}
          disabled={!canGoPrev}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="text-sm text-neutral-400 min-w-[140px] text-center">
          Bars <span className="text-white font-medium">{startBar}</span>–
          {endBar} of {totalBars}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={goToNextPage}
          disabled={!canGoNext}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={goToLastPage}
          disabled={!canGoNext}
          className="h-8 w-8 p-0"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default GridToolbar;
