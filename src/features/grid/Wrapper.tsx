import { useContextMenu } from "../context-menu/useContextMenu";
import useStackIdStore from "../stores/useStackIdStore";
import { useScreenMeasurements } from "../screen/useScreenMeasurements";
import { useScreen } from "../screen/useScreen";
import { useTransportSync } from "../transport/useTransportSync";

import GridEntries from "@/features/grid/Entries";
import type { RefObject } from "react";

const GridWrapper = () => {
  const stackId = useStackIdStore((state) => state.stackId);

  const { scrollAreaRef } = useScreenMeasurements() as {
    scrollAreaRef: RefObject<HTMLDivElement | null>;
  };

  const { screen, isLoading, isError } = useScreen(stackId);

  const gridLengthInBars = screen?.gridLengthInBars ?? 8;

  const { menu, showMenu, closeMenu } = useContextMenu(
    scrollAreaRef as RefObject<HTMLElement>,
  );

  useTransportSync(scrollAreaRef);

  if (isError) return null;
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-[#1a1a1a]">
        Loading grid...
      </div>
    );
  }

  if (!screen) return null;

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a]">
      <GridEntries
        gridLengthInBars={gridLengthInBars}
        menu={menu}
        showMenu={showMenu}
        closeMenu={closeMenu}
        scrollAreaRef={scrollAreaRef}
      />
    </div>
  );
};

export default GridWrapper;
