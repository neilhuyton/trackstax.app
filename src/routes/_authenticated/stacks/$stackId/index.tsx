import { createFileRoute } from "@tanstack/react-router";
import GridContainer from "@/features/grid/GridContainer";
import { TrackListSheet } from "@/features/track/TrackListSheet";
import { TrackToolsSheet } from "@/features/track/TrackToolsSheet";

import useTransportStore from "@/features/transport/hooks/useTransportStore";
import usePositionStore from "@/features/position/hooks/usePositionStore";
import * as Tone from "tone";
import { useEffect } from "react";
import { trpc } from "@/trpc";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/stacks/$stackId/")({
  validateSearch: (search: Record<string, unknown>) => {
    const page = typeof search.page === "number" ? search.page : 0;
    return { page: Math.max(0, page) };
  },

  component: StackGridPage,
});

function StackGridPage() {
  const queryClient = useQueryClient();
  const { stackId } = Route.useParams();

  const setIsPlay = useTransportStore((s) => s.setIsPlay);
  const setPosition = usePositionStore((s) => s.setPosition);
  const setStopPosition = usePositionStore((s) => s.setStopPosition);

  // Reset transport and position when leaving the page
  useEffect(() => {
    return () => {
      if (Tone.getTransport().state === "started") {
        Tone.getTransport().stop();
      }
      Tone.getTransport().position = "0:0:0";

      setIsPlay(false);
      setPosition("0:0:0");
      setStopPosition("0:0:0");
    };
  }, [setIsPlay, setPosition, setStopPosition]);

  // Invalidate tracks (and stack) when leaving the grid page
  // This ensures fresh durations are loaded when returning from the stacks list
  useEffect(() => {
    return () => {
      if (!stackId) return;

      queryClient.invalidateQueries({
        queryKey: trpc.stack.getById.queryKey({ id: stackId }),
      });

      queryClient.invalidateQueries({
        queryKey: trpc.track.getByStackId.queryKey({ stackId }),
      });
    };
  }, [queryClient, stackId]);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#1a1a1a]">
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        <TrackListSheet />
        <div className="flex-1 min-h-0 overflow-hidden">
          <GridContainer />
        </div>
        <TrackToolsSheet />
      </div>
    </div>
  );
}