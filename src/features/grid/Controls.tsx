import { useCallback, useRef } from "react";

import { Button } from "@/components/ui/button";
import GridTitle from "@/features/grid/Title";

import { PIXELS_PER_BAR } from "@/consts";
import { type Screen, type Track } from "@/types";
import { getLastBar } from "@/utils";

import type { RefObject } from "react";
import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";

type GridControlsProps = {
  gridLengthInBars: number;
  screen: Screen;
  tracks: Track[];
  scrollAreaRef: RefObject<HTMLDivElement | null>;
};

const GridControls = ({
  gridLengthInBars,
  screen,
  tracks,
  scrollAreaRef,
}: GridControlsProps) => {
  const scrollLeftIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRightIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateScreenMutation = useMutation(
    trpc.screen.update.mutationOptions({
      onError: (error) => {
        console.error("Failed to update screen:", error);
      },
    }),
  );

  const handleBackwardClick = useCallback(() => {
    const lastBar = getLastBar(tracks);
    const newLengthInBars = gridLengthInBars - 8;

    if (newLengthInBars < lastBar || newLengthInBars < 1) return;

    const stackId = screen.stackId;

    if (!stackId) return;

    updateScreenMutation.mutate({
      stackId,
      gridLengthInBars: newLengthInBars,
    });
  }, [gridLengthInBars, screen, tracks, updateScreenMutation]);

  const handleForwardClick = useCallback(() => {
    const newLengthInBars = gridLengthInBars + 8;
    if (newLengthInBars > 300) return;

    const stackId = screen.stackId;

    if (!stackId) return;

    updateScreenMutation.mutate({
      stackId,
      gridLengthInBars: newLengthInBars,
    });
  }, [gridLengthInBars, screen, updateScreenMutation]);

  const startScrollingLeft = useCallback(() => {
    if (!scrollAreaRef.current || scrollLeftIntervalRef.current) return;

    scrollAreaRef.current.scrollLeft -= PIXELS_PER_BAR;

    scrollLeftIntervalRef.current = setInterval(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollLeft -= PIXELS_PER_BAR * 2;
      }
    }, 100);
  }, [scrollAreaRef]);

  const startScrollingRight = useCallback(() => {
    if (!scrollAreaRef.current || scrollRightIntervalRef.current) return;

    scrollAreaRef.current.scrollLeft += PIXELS_PER_BAR;

    scrollRightIntervalRef.current = setInterval(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollLeft += PIXELS_PER_BAR * 2;
      }
    }, 100);
  }, [scrollAreaRef]);

  const stopScrolling = useCallback(() => {
    if (scrollLeftIntervalRef.current) {
      clearInterval(scrollLeftIntervalRef.current);
      scrollLeftIntervalRef.current = null;
    }
    if (scrollRightIntervalRef.current) {
      clearInterval(scrollRightIntervalRef.current);
      scrollRightIntervalRef.current = null;
    }
  }, []);

  return (
    <div
      data-testid="grid-controls"
      className="pb-4 flex items-center border-0 box-border"
    >
      <div className="flex-1">
        <GridTitle />
      </div>

      <div className="flex-1 flex justify-end gap-4">
        <div data-testid="button-group" className="flex gap-2">
          <Button
            title="Reduce grid length"
            aria-label="Reduce grid length"
            variant="outline"
            onClick={handleBackwardClick}
            disabled={updateScreenMutation.isPending}
          >
            {"<<"}
          </Button>
          <Button
            title="Increase grid length"
            aria-label="Increase grid length"
            variant="outline"
            onClick={handleForwardClick}
            disabled={updateScreenMutation.isPending}
          >
            {">>"}
          </Button>
        </div>

        <div data-testid="button-group" className="flex gap-2">
          <Button
            title="Scroll grid backward"
            aria-label="Scroll grid backward"
            variant="outline"
            onMouseDown={startScrollingLeft}
            onMouseUp={stopScrolling}
            onMouseLeave={stopScrolling}
          >
            {"<"}
          </Button>

          <Button
            title="Scroll grid forward"
            aria-label="Scroll grid forward"
            variant="outline"
            onMouseDown={startScrollingRight}
            onMouseUp={stopScrolling}
            onMouseLeave={stopScrolling}
          >
            {">"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GridControls;
