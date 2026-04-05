import { useMemo } from "react";
import * as Tone from "tone";
import { useSearch } from "@tanstack/react-router";

import useStackIdStore from "../stacks/hooks/useStackIdStore";
import { useScreen } from "../screen/hooks/useScreen";
import usePositionStore from "../position/hooks/usePositionStore";
import { useTransportRead } from "../transport/hooks/useTransportRead";

const GridBars = () => {
  const { page = 0 } = useSearch({ from: "/_authenticated/stacks/$stackId/" });
  const pageSize = 8;
  const visibleStartBar = page * pageSize;

  const stackId = useStackIdStore((state) => state.stackId);
  const { transport, isError: transportError } = useTransportRead(stackId);
  const { isError: screenError } = useScreen(stackId);
  const { position } = usePositionStore();

  const isError = screenError || transportError;

  const { isLoop, loopStart, loopEnd } = transport || {
    isLoop: false,
    loopStart: 0,
    loopEnd: 0,
  };

  const bars = useMemo(() => Array.from({ length: pageSize }), [pageSize]);

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
      return -1;
    }
  }, [position]);

  const getBgColor = (i: number) => {
    const globalBar = visibleStartBar + i;

    if (globalBar === currentBar && currentBar >= 0) {
      return "bg-neutral-500";
    }

    if (isLoop && globalBar >= loopStart && globalBar < loopEnd) {
      return "bg-neutral-700";
    }

    return "bg-neutral-900";
  };

  const getTextColor = (i: number) => {
    const globalBar = visibleStartBar + i;

    if (globalBar === currentBar && currentBar >= 0) {
      return "text-white font-extrabold";
    }

    return "text-neutral-300 font-light";
  };

  if (isError) return null;

  return (
    <div className="grid grid-cols-8 gap-1.5 bg-[#2a2a2a] rounded-lg overflow-hidden">
      {bars.map((_, i) => {
        const globalBar = visibleStartBar + i;
        return (
          <div
            key={`bar-${globalBar}`}
            className={`
              flex items-center justify-center 
              text-sm rounded 
              transition-colors duration-75
              ${getBgColor(i)}
              ${getTextColor(i)}
            `}
          >
            {globalBar + 1}
          </div>
        );
      })}
    </div>
  );
};

export default GridBars;
