import { useMemo, forwardRef } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

const BAR_COUNT = 8;

type Props = {
  currentBar: number;
};

const PianoRollHeader = forwardRef<HTMLDivElement, Props>(
  ({ currentBar }, ref) => {
    const navigate = useNavigate();
    const { stackId } = useParams({ from: "/_authenticated/stacks/$stackId" });

    const bars = useMemo(() => Array.from({ length: BAR_COUNT }), []);

    const handleBack = () => {
      navigate({
        to: "/stacks/$stackId",
        params: { stackId },
        search: { page: 0 },
      });
    };

    return (
      <div className="flex border-b border-zinc-700 bg-zinc-900">
        <button
          onClick={handleBack}
          className="w-16 flex-shrink-0 border-r border-zinc-700 flex items-center justify-center hover:bg-zinc-800 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-neutral-400" />
        </button>

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

PianoRollHeader.displayName = "PianoRollHeader";

export default PianoRollHeader;
