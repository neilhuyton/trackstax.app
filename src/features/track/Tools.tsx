import DestinationTools from "@/features/destination/tools";
import TrackFavourite from "@/features/track/Favourite";
import TrackMuteButton from "@/features/track/MuteButton";
import TrackSoloButton from "@/features/track/SoloButton";
import TrackVolumeDialog from "@/features/track/VolumeDialog";
import { borderColors } from "@/consts";
import { type Track } from "@/types";
import type { RefObject } from "react";

import useTracksStore from "../stores/tracks";

export const TrackTools = ({
  ref,
}: {
  ref: RefObject<HTMLDivElement | null>;
}) => {
  const { tracks } = useTracksStore();

  return (
    <div ref={ref} className="sticky right-0 z-10">
      <div className="bg-neutral-900 min-h-full">
        <div className="flex h-[47px] shrink-0 pt-[6px]">
          <DestinationTools />
        </div>

        {tracks.map((track: Track) => {
          const color = borderColors[track.color as keyof typeof borderColors];
          return (
            <div className="flex h-12 shrink-0 pt-[6px]" key={track.id}>
              <div
                className={`w-full h-full flex items-center justify-between rounded-md gap-4 px-4 border-2 ${color}`}
              >
                <div>
                  <TrackFavourite track={track} />
                </div>

                <div>
                  <TrackVolumeDialog track={track} />
                </div>

                <div>
                  <TrackMuteButton track={track} />
                </div>

                <div>
                  <TrackSoloButton track={track} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackTools;
