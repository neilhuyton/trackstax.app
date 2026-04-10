import { useEffect, useRef } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import useTransportStore from "@/features/transport/hooks/useTransportStore";
import usePositionStore from "@/features/position/hooks/usePositionStore";

export const useGridAutoPage = (totalBars: number) => {
  const navigate = useNavigate();
  const { page = 0 } = useSearch({ from: "/_authenticated/stacks/$stackId/" });

  const { isPlay, isRecord } = useTransportStore();
  const { position } = usePositionStore();

  const pageSize = 8;
  const totalPages = Math.ceil(totalBars / pageSize);

  const lastAutoPagedToRef = useRef(page);
  const allowAutoPageRef = useRef(true);

  useEffect(() => {
    allowAutoPageRef.current = false;
    lastAutoPagedToRef.current = page;
  }, [page]);

  useEffect(() => {
    if (!isPlay && !isRecord) {
      allowAutoPageRef.current = true;
      lastAutoPagedToRef.current = page;
      return;
    }

    const interval = setInterval(() => {
      let currentBar = 0;

      try {
        const posString = String(position);
        if (posString.includes(":")) {
          const [barsStr] = posString.split(":");
          currentBar = parseInt(barsStr, 10);
        }
      } catch {
        // fail silently
      }

      if (isNaN(currentBar)) return;

      const threshold = (page + 1) * pageSize;

      if (
        currentBar >= threshold &&
        allowAutoPageRef.current &&
        page === lastAutoPagedToRef.current &&
        page < totalPages - 1
      ) {
        const nextPage = page + 1;

        navigate({
          to: ".",
          search: { page: nextPage },
          replace: true,
        });

        lastAutoPagedToRef.current = nextPage;
        allowAutoPageRef.current = false;
      }

      const playheadPage = Math.floor(currentBar / pageSize);
      if (playheadPage > page) {
        allowAutoPageRef.current = false;
      }
    }, 80);

    return () => clearInterval(interval);
  }, [isPlay, isRecord, page, navigate, totalPages, pageSize, position]);

  useEffect(() => {
    if (!isPlay && !isRecord) return;

    const reenable = setInterval(() => {
      let currentBar = 0;
      try {
        const posString = String(position);
        if (posString.includes(":")) {
          const [barsStr] = posString.split(":");
          currentBar = parseInt(barsStr, 10);
        }
      } catch {
        // fail silently
      }

      if (!isNaN(currentBar)) {
        const playheadPage = Math.floor(currentBar / pageSize);
        if (playheadPage === page) {
          allowAutoPageRef.current = true;
        }
      }
    }, 200);

    return () => clearInterval(reenable);
  }, [isPlay, isRecord, page, pageSize, position]);
};
