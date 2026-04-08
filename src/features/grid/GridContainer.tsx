import GridTrackRow from "./TrackRow";
import GridToolbar from "./GridToolbar";
import useTracksStore from "../track/hooks/useTracksStore";
import { type Track } from "@/types";
import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTrackDurations } from "@/features/utils/track-utils";
import { useSearch } from "@tanstack/react-router";
import GridBars from "./GridBars";

const GridContainer = () => {
  const queryClient = useQueryClient();
  const { stackId } = useParams({ from: "/_authenticated/stacks/$stackId/" });
  const { page = 0 } = useSearch({ from: "/_authenticated/stacks/$stackId/" });
  const pageSize = 8;

  const { tracks, trackErrors, storeUpdateTrack } = useTracksStore();
  const visibleStartBar = page * pageSize;

  const updateDurationsMutation = useMutation(
    trpc.track.updateDurations.mutationOptions({}),
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
    <div className="h-full bg-[#1a1a1a] flex flex-col">
      <div className="flex-1 grid grid-rows-[repeat(10,minmax(0,1fr))] gap-1.5 min-h-0 overflow-hidden">
        <GridToolbar />
        <GridBars />

        {tracks && tracks.length > 0 ? (
          tracks.map((track: Track) => {
            const hasError = trackErrors.some((e) => e.trackId === track.id);
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
          <div className="bg-[#2a2a2a] rounded-lg row-span-8 flex items-center justify-center text-neutral-400">
            No tracks yet
          </div>
        )}

        {Array.from({ length: placeholderCount }).map((_, i) => (
          <div key={`ph-${i}`} className="bg-[#2a2a2a] rounded-lg" />
        ))}
      </div>
    </div>
  );
};

export default GridContainer;
