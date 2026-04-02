// src/features/grid/GridContainer.tsx
import GridHeader from "./Header";
import GridTrackRow from "./TrackRow";
import GridPager from "./GridPager";
import useTracksStore from "../track/hooks/useTracksStore";
import { type Track } from "@/types";
import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";
import { updateTrackDurations } from "@/features/utils/track-utils";
import { useSearch } from "@tanstack/react-router";
// import { useSamplerPattern } from "./hooks/useSamplePattern";

type SamplerEvent = {
  time: string;
  note: string;
  duration?: string;
};

const GridContainer = () => {
  const { page = 0 } = useSearch({ from: "/_authenticated/stacks/$stackId/" });
  const pageSize = 8;

  const { tracks, trackErrors, storeUpdateTrack } = useTracksStore();
  const visibleStartBar = page * pageSize;

  const updateDurationsMutation = useMutation(
    trpc.track.updateDurations.mutationOptions({ onSuccess: () => {} }),
  );

  // Define your pattern here (or move to a store / prop later)
  const samplerPattern: SamplerEvent[] = [
    { time: "0:0:0", note: "D3", duration: "6n" },
    { time: "0:0:3", note: "D3", duration: "6n" },
    { time: "0:1:2", note: "D3", duration: "6n" },
    { time: "0:2:1", note: "D3", duration: "6n" },
    { time: "0:3:0", note: "D3", duration: "6n" },
    { time: "0:3:2", note: "E3", duration: "6n" },

    { time: "0:4:0", note: "D3", duration: "6n" },
    { time: "0:4:3", note: "D3", duration: "6n" },
    { time: "0:5:2", note: "D3", duration: "6n" },
    { time: "0:6:1", note: "D3", duration: "6n" },
    { time: "0:7:0", note: "D3", duration: "6n" },
    { time: "0:7:2", note: "B2", duration: "6n" },
  ];

  // const { isLoaded, error } = useSamplerPattern(samplerPattern);

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

      {/* Grid Area */}
      <div className="flex-1 grid grid-rows-[repeat(10,minmax(0,1fr))] gap-1.5 min-h-0 overflow-hidden">
        <GridPager />
        <GridHeader />

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
