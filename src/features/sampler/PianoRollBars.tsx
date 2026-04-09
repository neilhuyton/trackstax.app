import { useMemo, forwardRef } from "react";
import usePositionStore from "@/features/position/hooks/usePositionStore";

type Props = {
  currentBar?: number;
  loopLength: number;
};

const PianoRollBars = forwardRef<HTMLDivElement, Props>(
  ({ currentBar: propCurrentBar, loopLength }, ref) => {
    const { position } = usePositionStore();

    const currentBar = useMemo(() => {
      if (propCurrentBar !== undefined) return propCurrentBar;

      if (!position) return -1;

      const posString = String(position);
      if (posString.includes(":")) {
        const [barsStr] = posString.split(":");
        const bar = parseInt(barsStr, 10);
        return isNaN(bar) ? -1 : bar;
      }

      return -1;
    }, [position, propCurrentBar]);

    // Calculate which bar in the loop is currently active (cycles 0 to loopLength-1)
    const activeLoopBar = useMemo(() => {
      if (currentBar < 0) return -1;
      return currentBar % loopLength;
    }, [currentBar, loopLength]);

    const bars = useMemo(() => Array.from({ length: 8 }), []);

    return (
      <div className="flex border-b border-zinc-700 bg-zinc-900">
        <div className="w-16 flex-shrink-0 border-r border-zinc-700" />

        <div
          ref={ref}
          className="flex flex-1 min-w-0 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {bars.map((_, i) => {
            const isInLoop = i < loopLength;
            const isActive = isInLoop && activeLoopBar === i;

            return (
              <div
                key={i}
                className={`
                h-8 flex items-center justify-center 
                text-xs font-medium border-r border-zinc-700 last:border-r-0
                transition-colors shrink-0
                ${
                  isInLoop
                    ? isActive
                      ? "bg-neutral-500 text-white"
                      : "bg-zinc-950 text-neutral-400"
                    : "bg-zinc-900 text-neutral-600"
                }
              `}
                style={{ width: "448px" }}
              >
                Bar {i + 1}
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);

PianoRollBars.displayName = "PianoRollBars";

export default PianoRollBars;
