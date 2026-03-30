import React from "react";

// import GridHeader from "@/features/grid/Header";
// import GridExtraRow from "@/features/grid/ExtraRow";
import GridTracks from "@/features/grid/Tracks";
import GridPlayHead from "@/features/grid/PlayHead";

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

  if (stackError) {
    return <div className="text-red-500 p-4">Error loading stack</div>;
  }

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a] p-1.5 overflow-hidden">
      <div className="flex-1 grid grid-rows-[repeat(10,minmax(0,1fr))] gap-1.5 min-h-0 overflow-hidden">
        <GridTracks
          tracks={tracks}
          gridLengthInBars={gridLengthInBars}
          trackErrors={trackErrors}
          menu={menu}
          showMenu={showMenu}
          closeMenu={closeMenu}
        />
      </div>

      <GridPlayHead scrollAreaRef={scrollAreaRef} />
    </div>
  );
};

export default GridEntries;
