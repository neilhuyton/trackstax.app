import { useEffect } from "react";
import * as Tone from "tone";
import usePositionStore from "../stores/position";
import useTransportStore from "../stores/transport";

export const useGridEndStop = (totalBars: number) => {
  const { position } = usePositionStore();
  const { isPlay, isRecord, setIsPlay } = useTransportStore();

  useEffect(() => {
    if (!isPlay && !isRecord) return;

    let currentBar = 0;

    try {
      const pos = Tone.getTransport().position as string;

      if (typeof pos === "string" && pos.includes(":")) {
        const [barsStr] = pos.split(":");
        currentBar = parseInt(barsStr, 10);
      } else {
        const bbs = Tone.TransportTime(position).toBarsBeatsSixteenths();
        currentBar = parseInt(bbs.split(":")[0], 10);
      }
      if (isNaN(currentBar)) currentBar = 0;
    } catch {
      currentBar = 0;
    }

    if (currentBar >= totalBars) {
      Tone.getTransport().stop();
      Tone.getTransport().position = `${totalBars}:0:0`;
      setIsPlay(false);
    }
  }, [position, totalBars, isPlay, isRecord, setIsPlay]);
};
