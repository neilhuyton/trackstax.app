import { useMemo } from "react";
import useStackIdStore from "../stores/useStackIdStore";
import { useTransportRead } from "../transport/useTransportRead";
import { useScreen } from "../screen/useScreen";

const GridHeader = () => {
  const stackId = useStackIdStore((state) => state.stackId);
  const { transport, isError: transportError } = useTransportRead(stackId);
  const { screen, isError: screenError } = useScreen(stackId);

  const isError = screenError || transportError;

  const { gridLengthInBars } = screen || { gridLengthInBars: 0 };
  const { isLoop, loopStart, loopEnd } = transport || {
    isLoop: false,
    loopStart: 0,
    loopEnd: 0,
  };

  const bars = useMemo(
    () => Array.from({ length: gridLengthInBars }),
    [gridLengthInBars],
  );

  const getBgColor = (i: number) => {
    const bg = i % 8 === 0 ? "bg-neutral-800" : "bg-neutral-900";
    return isLoop && i < loopEnd && i >= loopStart ? "bg-neutral-700" : bg;
  };

  if (isError) return null;

  return (
    <div className="sticky top-0 flex z-10">
      {bars.map((_, i) => {
        const fontWeight = i % 8 === 0 ? "font-extrabold" : "font-light";
        const dividerColor = i % 8 === 0 ? "white" : "#9b9b9b";

        return (
          <div key={`bar-${i}`} className={getBgColor(i)}>
            <div className={`h-6 text-xs pt-1 ${fontWeight}`}>Bar {i + 1}</div>
            <div
              className="h-6"
              style={{
                background: `linear-gradient(to right, ${dividerColor} 1px, transparent 0px), linear-gradient(to right, #525252 1px, transparent 0px)`,
                backgroundSize: "84px, 21px",
                backgroundPosition: "2px",
                width: "84px",
              }}
            ></div>
          </div>
        );
      })}
    </div>
  );
};

export default GridHeader;
