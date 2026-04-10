import { type Track } from "@/types";
import TrackDialog from "./Dialog";
import useTracksStore from "./hooks/useTracksStore";
import { AddTrackButton } from "./AddTrackButton";
import { memo } from "react";

const TrackList = () => {
  const { tracks, trackErrors } = useTracksStore();

  return (
    <div data-testid="track-list" className="h-full flex flex-col">
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full grid gap-1.5 grid-rows-[repeat(10,minmax(0,1fr))]">
          <div></div>
          <AddTrackButton />
          {tracks?.map((track: Track) => {
            const trackError = trackErrors.some(
              (error) => error.trackId === track.id,
            );
            return (
              <TrackDialog
                track={track}
                key={track.id}
                trackError={trackError}
              />
            );
          })}
          {Array.from({ length: Math.max(0, 8 - (tracks?.length || 0)) }).map(
            (_, i) => (
              <div
                key={`placeholder-${i}`}
                className="bg-neutral-900 rounded-lg"
              />
            ),
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(TrackList);
