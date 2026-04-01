import GridHeader from "./Header";
import GridTrackRow from "./TrackRow";
import GridPager from "./GridPager";
import useTracksStore from "../track/hooks/useTracksStore";
import { type Track } from "@/types";
import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";
import { updateTrackDurations } from "@/features/utils/track-utils";
import { useGridPageStore } from "./hooks/useGridPageStore";

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

  const trackCount = tracks?.length || 0;
  const placeholderCount = Math.max(0, 8 - trackCount);

  return (
    <div className="h-full bg-[#1a1a1a] p-1.5 flex flex-col">
      <div className="flex-1 grid grid-rows-[repeat(10,minmax(0,1fr))] gap-1.5 min-h-0 overflow-hidden">
        <GridPager />
        <GridHeader />
        {tracks && tracks.length > 0 ? (
          <>
            {tracks.map((track: Track) => {
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
            })}
            {Array.from({ length: placeholderCount }).map((_, i) => (
              <div key={`ph-${i}`} className="bg-[#2a2a2a] rounded-lg" />
            ))}
          </>
        ) : (
          <div className="bg-[#2a2a2a] rounded-lg row-span-8 flex items-center justify-center text-neutral-400">
            No tracks yet
          </div>
        )}
      </div>
    </div>
  );
};

export default GridContainer;
