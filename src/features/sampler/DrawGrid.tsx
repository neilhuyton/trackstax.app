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
    const { canvasRef } = useDrawGrid({
      notes,
      totalSteps,
      pixelSize,
      lines,
      onLineComplete,
    });

    return (
      <div ref={ref} className="flex-1 overflow-auto bg-zinc-950">
        <div className="inline-block p-0 min-w-max">
          <div className="border border-zinc-700 shadow-xl overflow-hidden bg-zinc-900">
            <canvas
              ref={canvasRef}
              className="block image-rendering-pixelated cursor-crosshair"
              style={{
                imageRendering: "pixelated",
                width: `${totalSteps * pixelSize}px`,
                height: `${notes.length * pixelSize}px`,
                touchAction: "auto",
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
