import { forwardRef, useState, useRef, useEffect } from "react";
import type { Line, NoteName } from "@/types";
import PianoRollPopover from "./PianoRollPopover";
import { useDrawGrid } from "./hooks/useDrawGrid";

type Props = {
  notes: readonly NoteName[];
  totalSteps: number;
  pixelSize?: number;
  lines: readonly Line[];
  onLineComplete: (
    rowIndex: number,
    startStep: number,
    endStep: number,
  ) => void;
};

const DrawGrid = forwardRef<HTMLDivElement, Props>(
  ({ notes, totalSteps, pixelSize = 28, lines, onLineComplete }, ref) => {
    const canvasWidth = totalSteps * pixelSize;
    const canvasHeight = notes.length * pixelSize;

    const [key, setKey] = useState(0);
    const [popoverData, setPopoverData] = useState<{
      rowIndex: number;
      step: number;
      clientX: number;
      clientY: number;
    } | null>(null);

    const gridScrollRef = useRef<HTMLDivElement>(null);
    const headerScrollRef = useRef<HTMLDivElement>(null);

    const { canvasRef } = useDrawGrid({
      notes,
      totalSteps,
      pixelSize,
      lines,
      onLineComplete,
      onLongPress: (rowIndex, step, clientX, clientY) => {
        setPopoverData({ rowIndex, step, clientX, clientY });
        setKey((prev) => prev + 1);
      },
    });

    useEffect(() => {
      const grid = gridScrollRef.current;
      const header = headerScrollRef.current;
      if (!grid || !header) return;

      let rafId: number;

      const syncHeader = () => {
        if (header.scrollLeft !== grid.scrollLeft) {
          header.scrollLeft = grid.scrollLeft;
        }
      };

      const syncGrid = () => {
        if (grid.scrollLeft !== header.scrollLeft) {
          grid.scrollLeft = header.scrollLeft;
        }
      };

      const throttledSyncHeader = () => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(syncHeader);
      };

      const throttledSyncGrid = () => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(syncGrid);
      };

      grid.addEventListener("scroll", throttledSyncHeader, { passive: true });
      header.addEventListener("scroll", throttledSyncGrid, { passive: true });

      return () => {
        cancelAnimationFrame(rafId);
        grid.removeEventListener("scroll", throttledSyncHeader);
        header.removeEventListener("scroll", throttledSyncGrid);
      };
    }, []);

    useEffect(() => {
      const container = gridScrollRef.current;
      if (!container) return;

      const handleScroll = () => {
        setPopoverData(null);
      };

      container.addEventListener("scroll", handleScroll, { passive: true });

      return () => {
        container.removeEventListener("scroll", handleScroll);
      };
    }, []);

    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div
          ref={headerScrollRef}
          className="overflow-x-auto overflow-y-hidden bg-zinc-900 border-b border-zinc-800"
        >
          {/* PianoRollBars is rendered by parent */}
        </div>

        <div
          ref={(el) => {
            gridScrollRef.current = el;
            if (typeof ref === "function") ref(el);
            else if (ref) ref.current = el;
          }}
          className="flex-1 overflow-auto bg-zinc-950 relative"
          style={{
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
          }}
        >
          <div className="inline-block p-0 min-w-max">
            <div className="overflow-hidden bg-zinc-900">
              <canvas
                ref={canvasRef}
                className="block cursor-crosshair"
                style={{
                  imageRendering: "pixelated",
                  width: `${canvasWidth}px`,
                  height: `${canvasHeight}px`,
                }}
              />
            </div>
          </div>
        </div>

        <PianoRollPopover
          key={key}
          popoverData={popoverData}
          notes={notes}
          onDelete={(rowIndex, step) => {
            onLineComplete(rowIndex, step, step - 1);
          }}
          onClose={() => setPopoverData(null)}
        />
      </div>
    );
  },
);

DrawGrid.displayName = "DrawGrid";

export default DrawGrid;
