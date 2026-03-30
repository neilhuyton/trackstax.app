import { type Track } from "@/types";
import type { RefObject } from "react";
import TrackAddDialog from "./AddDialog";
import TrackDialog from "./Dialog";
import useTracksStore from "../stores/tracks";

interface TrackListProps {
  trackListRef: RefObject<HTMLDivElement | null>;
}

const TrackList = ({ trackListRef }: TrackListProps) => {
  const { tracks, trackErrors } = useTracksStore();

  return (
    <div
      data-testid="track-list"
      ref={trackListRef}
      className="sticky left-0 z-20"
    >
      <div data-testid="track-list-inner" className="bg-neutral-900 min-h-full">
        <div data-testid="track-list-spacer" className="w-36 h-[47px]"></div>

        {tracks?.map((track: Track) => {
          const trackError = trackErrors.some(
            (error) => error.trackId === track.id,
          );

          return (
            <TrackDialog track={track} key={track.id} trackError={trackError} />
          );
        })}

        <TrackAddDialog />
      </div>
    </div>
  );
};

export default TrackList;
