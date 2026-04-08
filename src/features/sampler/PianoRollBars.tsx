import { useMemo, forwardRef } from "react";
import usePositionStore from "@/features/position/hooks/usePositionStore";

const BAR_COUNT = 8;

type Props = {
  currentBar?: number;
};

const PianoRollBars = forwardRef<HTMLDivElement, Props>(
  ({ currentBar: propCurrentBar }, ref) => {
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

    const bars = useMemo(() => Array.from({ length: BAR_COUNT }), []);

    return (
      <div className="flex border-b border-zinc-700 bg-zinc-900">
        <div className="w-16 flex-shrink-0 border-r border-zinc-700" />

        <div
          ref={ref}
          className="flex flex-1 min-w-0 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {bars.map((_, i) => {
            const isActive = currentBar === i;
            return (
              <div
                key={i}
                className={`
                h-8 flex items-center justify-center 
                text-xs font-medium border-r border-zinc-700 last:border-r-0
                transition-colors shrink-0
                ${
                  isActive
                    ? "bg-neutral-500 text-white"
                    : "bg-zinc-950 text-neutral-400"
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
