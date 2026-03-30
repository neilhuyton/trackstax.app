import { type Track } from "@/types";
import TrackDialog from "./Dialog";
import useTracksStore from "../stores/tracks";

const TrackList = () => {
  const { tracks, trackErrors } = useTracksStore();

  return (
    <div data-testid="track-list" className="h-full flex flex-col">
      <div className="flex-1 min-h-0 overflow-hidden p-1.5">
        <div
          className="h-full grid gap-1.5"
          style={{
            gridTemplateRows: `repeat(${(tracks?.length || 0) + 2}, minmax(0, 1fr))`,
          }}
        >
          <div></div>
          <div></div>
          
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
        </div>
      </div>
    </div>
  );
};

export default TrackList;
