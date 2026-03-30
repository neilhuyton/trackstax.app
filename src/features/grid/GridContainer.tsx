import GridHeader from "./Header";
import GridTrackRow from "./TrackRow";
import GridPager from "./GridPager";
import useTracksStore from "../stores/tracks";
import { type Track } from "@/types";
import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";
import { updateTrackDurations } from "@/utils/track-utils";
import { useGridPageStore } from "../stores/useGridPageStore";

const GridContainer = () => {
  const { tracks, trackErrors, storeUpdateTrack } = useTracksStore();
  const { currentPage, pageSize } = useGridPageStore();
  const visibleStartBar = currentPage * pageSize;

  const updateDurationsMutation = useMutation(
    trpc.track.updateDurations.mutationOptions({
      onSuccess: () => {},
    }),
  );

  const handleToggle = (trackId: string, bar: number, wasActive: boolean) => {
    const track = tracks?.find((t) => t.id === trackId);
    if (!track) return;

    const updatedTrack = updateTrackDurations(track, bar, wasActive);

    storeUpdateTrack(updatedTrack);

    updateDurationsMutation.mutate({
      trackId: track.id,
      durations: updatedTrack.durations,
    });
  };

  return (
    <div className="h-full bg-[#1a1a1a] p-1.5 flex flex-col">
      <div className="flex-1 grid grid-rows-[repeat(10,1fr)] gap-1.5 min-h-0 overflow-hidden">
        <GridPager />
        <GridHeader />
        {tracks && tracks.length > 0 ? (
          tracks.map((track: Track) => {
            const hasError = trackErrors.some(
              (error) => error.trackId === track.id,
            );

            return (
              <GridTrackRow
                key={track.id}
                track={track}
                visibleStartBar={visibleStartBar}
                visibleBarCount={pageSize}
                hasError={hasError}
                onToggle={(bar, wasActive) =>
                  handleToggle(track.id, bar, wasActive)
                }
                onShowMenu={() => {}}
              />
            );
          })
        ) : (
          <div className="flex items-center justify-center text-neutral-400 h-full col-span-8">
            No tracks yet
          </div>
        )}
      </div>
    </div>
  );
};

export default GridContainer;
