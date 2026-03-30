import { useContextMenu } from "../context-menu/useContextMenu";
import useStackIdStore from "../stores/useStackIdStore";
import { useScreenMeasurements } from "../screen/useScreenMeasurements";
import useTracksStore from "../stores/tracks";
import { useScreen } from "../screen/useScreen";
import { useTransportSync } from "../transport/useTransportSync";

import { Card } from "@/components/ui/card";
import GridEntries from "@/features/grid/Entries";
import GridHeader from "@/features/grid/Header";
import TrackList from "@/features/track/List";
import TrackTools from "@/features/track/Tools";

import type { RefObject } from "react";
import GridControls from "./Controls";

const GridWrapper = () => {
  const stackId = useStackIdStore((state) => state.stackId);
  const { tracks } = useTracksStore();

  const { scrollAreaRef, trackListRef, trackToolsRef, handleScroll } =
    useScreenMeasurements() as {
      scrollAreaRef: RefObject<HTMLDivElement | null>;
      trackListRef: RefObject<HTMLDivElement | null>;
      trackToolsRef: RefObject<HTMLDivElement | null>;
      handleScroll: () => void;
    };

  const { menu, showMenu, closeMenu } = useContextMenu(
    scrollAreaRef as RefObject<HTMLElement>,
  );

  const { screen, isLoading, isError } = useScreen(stackId);

  const gridLengthInBars = screen?.gridLengthInBars ?? 0;

  useTransportSync(scrollAreaRef);

  if (isError) return null;
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
      </div>
    );
  }

  if (!screen) return null;

  return (
    <Card className="grid grid-cols-1 gap-4 w-full overflow-hidden h-full flex justify-start p-6">
      <GridControls
        gridLengthInBars={gridLengthInBars}
        screen={screen}
        tracks={tracks}
        scrollAreaRef={scrollAreaRef}
      />

      <div
        ref={scrollAreaRef as RefObject<HTMLDivElement>}
        className="overflow-auto flex h-full"
        onScroll={handleScroll}
      >
        <TrackList trackListRef={trackListRef} />

        <div className="flex flex-col min-h-0 flex-1">
          <GridHeader />
          <GridEntries
            gridLengthInBars={gridLengthInBars}
            menu={menu}
            showMenu={showMenu}
            closeMenu={closeMenu}
            scrollAreaRef={scrollAreaRef}
          />
        </div>

        <TrackTools ref={trackToolsRef} />
      </div>
    </Card>
  );
};

export default GridWrapper;