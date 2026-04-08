import { forwardRef } from "react";
import type { NoteName } from "@/types";
import { useDrawGrid } from "./hooks/useDrawGrid";

type Line = {
  rowIndex: number;
  startStep: number;
  endStep: number;
};

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

    const { canvasRef } = useDrawGrid({
      notes,
      totalSteps,
      pixelSize,
      lines,
      onLineComplete,
    });

    return (
      <div
        ref={ref}
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
    );
  },
);

DrawGrid.displayName = "DrawGrid";

export default DrawGrid;
