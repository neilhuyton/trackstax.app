import { useEffect } from "react";
import * as Tone from "tone";
import usePositionStore from "../position/usePositionStore";
import useTransportStore from "../transport/useTransportStore";
import { useGridPageStore } from "./useGridPageStore";

export const useGridAutoPage = (totalBars: number) => {
  const { currentPage, pageSize, goToNextPage } = useGridPageStore();
  const { position } = usePositionStore();
  const { isPlay, isRecord } = useTransportStore();

  const canGoNext = currentPage < Math.ceil(totalBars / pageSize) - 1;

  useEffect(() => {
    if (!position || (!isPlay && !isRecord)) return;

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

    const nextPageStartBar = (currentPage + 1) * pageSize;

    if (currentBar >= nextPageStartBar && canGoNext) {
      goToNextPage();
    }
  }, [
    position,
    currentPage,
    pageSize,
    canGoNext,
    goToNextPage,
    isPlay,
    isRecord,
  ]);
};
