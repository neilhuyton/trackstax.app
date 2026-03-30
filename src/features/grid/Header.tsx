import { useMemo } from "react";
import * as Tone from "tone";

import useStackIdStore from "../stores/useStackIdStore";
import { useTransportRead } from "../transport/useTransportRead";
import { useScreen } from "../screen/useScreen";
import usePositionStore from "../stores/position";

const GridHeader = () => {
  const stackId = useStackIdStore((state) => state.stackId);

  const { transport, isError: transportError } = useTransportRead(stackId);
  const { screen, isError: screenError } = useScreen(stackId);
  const { position } = usePositionStore();

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

  const currentBar = useMemo(() => {
    if (!position) return -1;

    try {
      const pos = Tone.getTransport().position as string;

      if (typeof pos === "string" && pos.includes(":")) {
        const [barsStr] = pos.split(":");
        const bar = parseInt(barsStr, 10);
        return isNaN(bar) ? -1 : bar;
      }

      const transportTime = Tone.TransportTime(position);
      const bbs = transportTime.toBarsBeatsSixteenths();
      const bar = parseInt(bbs.split(":")[0], 10);
      return isNaN(bar) ? -1 : bar;
    } catch {
      console.warn("Failed to parse current bar from position:", position);
      return -1;
    }
  }, [position]);

  const getBgColor = (i: number) => {
    let bg = i % 8 === 0 ? "bg-neutral-800" : "bg-neutral-900";

    if (isLoop && i >= loopStart && i < loopEnd) {
      bg = "bg-neutral-700";
    }

    if (i === currentBar && currentBar >= 0) {
      bg = "bg-neutral-500";
    }

    return bg;
  };

  const getTextColor = (i: number) => {
    if (i === currentBar && currentBar >= 0) {
      return "text-white font-extrabold";
    }
    return i % 8 === 0
      ? "text-white font-extrabold"
      : "text-neutral-300 font-light";
  };

  if (isError) return null;

  return (
    <div className="grid grid-cols-8 gap-1.5 bg-[#2a2a2a] rounded-lg overflow-hidden">
      {bars.map((_, i) => (
        <div
          key={`bar-${i}`}
          className={`
            flex items-center justify-center 
            text-sm rounded 
            transition-colors duration-75
            ${getBgColor(i)}
            ${getTextColor(i)}
          `}
        >
          {i + 1}
        </div>
      ))}
    </div>
  );
};

export default GridHeader;
