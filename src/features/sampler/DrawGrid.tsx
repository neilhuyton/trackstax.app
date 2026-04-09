import { forwardRef, useState } from "react";
import type { Line, NoteName } from "@/types";
import PianoRollPopover from "./PianoRollPopover";
import { useDrawGrid } from "./hooks/useDrawGrid";
import { getDurationInSteps } from "./utils/pianoRollUtils";

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
  loopLength: number;
};

const DrawGrid = forwardRef<HTMLDivElement, Props>(
  (
    { notes, totalSteps, pixelSize = 28, lines, onLineComplete, loopLength },
    ref,
  ) => {
    const canvasWidth = totalSteps * pixelSize;
    const canvasHeight = notes.length * pixelSize;

    const [key, setKey] = useState(0);
    const [popoverData, setPopoverData] = useState<{
      rowIndex: number;
      step: number;
      clientX: number;
      clientY: number;
    } | null>(null);

    const { canvasRef, setSelectedCell } = useDrawGrid({
      notes,
      totalSteps,
      pixelSize,
      lines,
      onLineComplete,
      loopLength,
      onLongPress: (rowIndex, step, clientX, clientY) => {
        setPopoverData({ rowIndex, step, clientX, clientY });
        setKey((prev) => prev + 1);
      },
    });

    const clearSelection = () => {
      setSelectedCell(null);
      setPopoverData(null);
    };

    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="overflow-x-auto overflow-y-hidden bg-zinc-900 border-b border-zinc-800" />

        <div
          ref={(el) => {
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
          lines={lines}
          onConfirm={(rowIndex, startStep, duration) => {
            const durationSteps = getDurationInSteps(duration);
            onLineComplete(rowIndex, startStep, startStep + durationSteps - 1);
            clearSelection();
          }}
          onDelete={(rowIndex, step) => {
            onLineComplete(rowIndex, step, step - 1);
            clearSelection();
          }}
          onClose={() => clearSelection()}
        />
      </div>
    );
  },
);

DrawGrid.displayName = "DrawGrid";

export default DrawGrid;
