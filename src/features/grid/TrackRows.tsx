import { memo, useCallback } from "react";

import GridTrackRow from "./TrackRow";
import useTracksStore from "../stores/tracks";
import { type Track } from "@/types";
import { updateTrackDurations } from "@/utils/track-utils";
import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";

const GridTrackRows = () => {
  const { tracks, trackErrors, storeUpdateTrack } = useTracksStore();

  const updateDurationsMutation = useMutation(
    trpc.track.updateDurations.mutationOptions({
      onSuccess: (updatedTrack) => {
        if (updatedTrack) storeUpdateTrack(updatedTrack);
      },
    }),
  );

  const handleToggle = useCallback(
    (trackId: string, bar: number, wasActive: boolean) => {
      const track = tracks?.find((t) => t.id === trackId);
      if (!track) {
        console.error("Track not found:", trackId);
        return;
      }

      console.log(
        `Toggle - Track ${track.id} | Bar ${bar} | wasActive: ${wasActive}`,
      );

      const updatedTrack = updateTrackDurations(track, bar, wasActive);

      // Optimistic update
      storeUpdateTrack(updatedTrack);

      // Save to DB
      updateDurationsMutation.mutate({
        trackId: track.id,
        durations: updatedTrack.durations,
      });
    },
    [tracks, storeUpdateTrack, updateDurationsMutation],
  );

  return (
    <>
      {tracks?.map((track: Track) => {
        const hasError = trackErrors.some((e) => e.trackId === track.id);

        return (
          <GridTrackRow
            key={track.id}
            track={track}
            gridLengthInBars={8}
            hasError={hasError}
            // This is the safe way to pass the handler
            onToggle={(bar: number, wasActive: boolean) =>
              handleToggle(track.id, bar, wasActive)
            }
            onShowMenu={() => {}}
          />
        );
      })}

      {(!tracks || tracks.length === 0) && (
        <div className="col-span-8 flex items-center justify-center text-neutral-400 py-12">
          No tracks yet
        </div>
      )}
    </>
  );
};

export default memo(GridTrackRows);
