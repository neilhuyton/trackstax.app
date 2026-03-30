import React, { useMemo } from "react";

import GridPlayHead from "@/features/grid/PlayHead";
import GridTracks from "@/features/grid/Tracks";

import useStackIdStore from "../stores/useStackIdStore";
import { useStack } from "../stacks/useStackRead";
import useTracksStore from "../stores/tracks";

type GridEntriesProps = {
  gridLengthInBars: number;
  menu: { x: number; y: number; trackId: string; bar: number } | null;
  showMenu: (e: React.MouseEvent, trackId: string, bar: number) => void;
  closeMenu: () => void;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
};

export const GridEntries = ({
  gridLengthInBars,
  menu,
  showMenu,
  closeMenu,
  scrollAreaRef,
}: GridEntriesProps) => {
  const stackId = useStackIdStore((state) => state.stackId);
  const { isError: stackError } = useStack(stackId);
  const { trackErrors, tracks } = useTracksStore();

  const gridBackground = useMemo(
    () =>
      "linear-gradient(to right, #404040 1px, transparent 0px), linear-gradient(to right, #303132 1px, transparent 0px)",
    [],
  );

  if (stackError) {
    return <div className="text-red-500">Error loading stack</div>;
  }

  return (
    <div
      data-testid="grid-entries-container"
      onDragOver={(e) => {
        e.preventDefault();
        e.currentTarget.style.border = "2px dashed #888";
      }}
      onDragLeave={(e) => {
        e.currentTarget.style.border = "none";
      }}
      onDrop={(e) => {
        e.currentTarget.style.border = "none";
      }}
      className="relative z-0 flex-1"
      style={{
        background: gridBackground,
        backgroundSize: "84px, 21px",
        backgroundPosition: "2px",
      }}
    >
      <GridTracks
        tracks={tracks}
        gridLengthInBars={gridLengthInBars}
        trackErrors={trackErrors}
        menu={menu}
        showMenu={showMenu}
        closeMenu={closeMenu}
      />
      <GridPlayHead scrollAreaRef={scrollAreaRef} />
    </div>
  );
};

export default GridEntries;
