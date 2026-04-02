import { useEffect } from "react";
import * as Tone from "tone";
import usePositionStore from "@/features/position/hooks/usePositionStore";
import useTransportStore from "@/features/transport/hooks/useTransportStore";
import { useNavigate, useSearch } from "@tanstack/react-router";

export const useGridAutoPage = (totalBars: number) => {
  const navigate = useNavigate();
  const { page = 0 } = useSearch({ from: "/_authenticated/stacks/$stackId/" });

  const { position } = usePositionStore();
  const { isPlay, isRecord } = useTransportStore();

  const pageSize = 8;
  const totalPages = Math.ceil(totalBars / pageSize);
  const currentPage = Math.max(0, Math.min(page, totalPages - 1));
  const canGoNext = currentPage < totalPages - 1;

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
      const newPage = currentPage + 1;
      navigate({
        to: ".",
        search: { page: newPage },
        replace: true,
      });
    }
  }, [position, currentPage, canGoNext, isPlay, isRecord, navigate]);
};
