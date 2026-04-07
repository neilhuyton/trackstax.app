import TrackMuteButton from "@/features/track/MuteButton";
import TrackSoloButton from "@/features/track/SoloButton";
import TrackVolumeDialog from "@/features/track/VolumeDialog";
import { borderColors } from "@/consts";
import { type Track } from "@/types";

import useTracksStore from "./hooks/useTracksStore";
import MasterVolumeDialog from "@/features/transport/MasterVolumeDialog";

export const TrackTools = () => {
  const { tracks } = useTracksStore();

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0 overflow-hidden p-1.5">
        <div className="h-full grid gap-1.5 grid-rows-[repeat(10,minmax(0,1fr))]">
          <div className="flex items-center px-4">
            <MasterVolumeDialog />
          </div>

          {tracks.map((track: Track) => {
            const color =
              borderColors[track.color as keyof typeof borderColors];
            return (
              <div
                key={track.id}
                className={`w-full h-full flex items-center justify-between rounded-md gap-4 px-4 border-2 ${color}`}
              >
                <div className="flex items-center">
                  <TrackVolumeDialog track={track} />
                </div>

                <div className="flex items-center">
                  <TrackMuteButton track={track} />
                </div>

                <div className="flex items-center">
                  <TrackSoloButton track={track} />
                </div>
              </div>
            );
          })}

          {Array.from({ length: Math.max(0, 8 - (tracks?.length || 0)) }).map(
            (_, i) => (
              <div
                key={`placeholder-${i}`}
                className="bg-neutral-900 rounded-md"
              />
            ),
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackTools;
