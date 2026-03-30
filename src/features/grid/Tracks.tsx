import { memo, useCallback } from "react";

import { GridTrackRow } from "@/features/grid/TrackRow";
import { type Track } from "@/types";
import { getIsActive, updateTrackDurations } from "@/utils/track-utils";
import useTracksStore from "../stores/tracks";

type GridTracksProps = {
  tracks: Track[];
  gridLengthInBars: number;
  trackErrors: Array<{ trackId: string }>;
  menu: { x: number; y: number; trackId: string; bar: number } | null;
  showMenu: (e: React.MouseEvent, trackId: string, bar: number) => void;
  closeMenu: () => void;
};

const GridTracksComponent = ({
  tracks,
  gridLengthInBars,
  trackErrors,
  menu,
  showMenu,
  closeMenu,
}: GridTracksProps) => {
  const { storeUpdateTrack } = useTracksStore();

  const updateTrackState = useCallback(
    async (track: Track) => {
      try {
        storeUpdateTrack(track);
      } catch (error) {
        console.error("updateTrack error:", error);
        throw error;
      }
    },
    [storeUpdateTrack],
  );

  const updateTracksState = useCallback(
    async (updatedTracks: Track[]) => {
      try {
        updatedTracks.forEach((track) => {
          storeUpdateTrack(track);
        });
      } catch (error) {
        console.error("updateTracks error:", error);
        throw error;
      }
    },
    [storeUpdateTrack],
  );

  const toggleTrack = useCallback(
    (track: Track, bar: number, isActive: boolean) => {
      const updated = updateTrackDurations(track, bar, isActive);
      updateTrackState(updated);
    },
    [updateTrackState],
  );

  const handleMenuItemClick = useCallback(
    (label: string) => {
      if (!menu) return;

      if (label === "Add 8 bar gap") {
        const updatedTracks = tracks.map((track) => {
          const updatedDurations = [
            ...track.durations.filter((d) => d.stop <= menu.bar),
            ...track.durations
              .filter((d) => d.start > menu.bar)
              .map((d) => ({
                ...d,
                start: d.start + 8,
                stop: d.stop + 8,
              })),
            ...track.durations
              .filter((d) => d.start <= menu.bar && d.stop > menu.bar)
              .flatMap((d) => {
                const result: Track["durations"] = [];
                if (d.start < menu.bar) {
                  result.push({ ...d, stop: menu.bar });
                }
                if (d.stop > menu.bar + 1) {
                  result.push({
                    ...d,
                    start: menu.bar + 8,
                    stop: d.stop + 8,
                  });
                }
                return result;
              }),
          ].sort((a, b) => a.start - b.start);

          return {
            ...track,
            durations: updatedDurations,
          };
        });

        updateTracksState(updatedTracks);
        return;
      }

      if (label === "Remove 8 bar gap") {
        const updatedTracks = tracks.map((track) => {
          const updatedDurations = [
            ...track.durations.filter((d) => d.stop <= menu.bar - 8),
            ...track.durations
              .filter((d) => d.start > menu.bar)
              .map((d) => ({
                ...d,
                start: Math.max(menu.bar, d.start - 8),
                stop: Math.max(menu.bar, d.stop - 8),
              })),
            ...track.durations
              .filter((d) => d.start <= menu.bar && d.stop > menu.bar)
              .flatMap((d) => {
                const result: Track["durations"] = [];
                if (d.start < menu.bar - 8) {
                  result.push({ ...d, stop: menu.bar - 8 });
                }
                if (d.stop > menu.bar + 1) {
                  const newStop = d.stop - 8;
                  if (newStop > menu.bar - 8) {
                    result.push({
                      ...d,
                      start: menu.bar - 8,
                      stop: newStop,
                    });
                  }
                }
                return result;
              }),
            ...track.durations
              .filter(
                (d) =>
                  d.start >= menu.bar - 8 &&
                  d.start <= menu.bar &&
                  d.stop > menu.bar,
              )
              .map((d) => ({
                ...d,
                stop: Math.max(menu.bar - 8, d.stop - 8),
              })),
          ]
            .filter((d) => d.start < d.stop)
            .sort((a, b) => a.start - b.start);

          return {
            ...track,
            durations: updatedDurations,
          };
        });

        updateTracksState(updatedTracks);
        return;
      }

      const track = tracks.find((t) => t.id === menu.trackId);
      if (!track) return;

      const barsToChange = parseInt(label.match(/\d+/)?.[0] || "0", 10);
      const isAdd = label.startsWith("Add");
      if (!barsToChange) return;

      let updatedTrack = { ...track };
      const startBar = menu.bar;
      const endBar = startBar + barsToChange;

      for (let bar = startBar; bar < endBar; bar++) {
        const isActive = getIsActive(bar, updatedTrack);
        if (isAdd && !isActive) {
          updatedTrack = updateTrackDurations(updatedTrack, bar, false);
        } else if (!isAdd && isActive) {
          updatedTrack = updateTrackDurations(updatedTrack, bar, true);
        }
      }

      updateTrackState(updatedTrack);
    },
    [menu, tracks, updateTrackState, updateTracksState],
  );

  return (
    <>
      {tracks.map((track: Track) => (
        <GridTrackRow
          key={track.id}
          track={track}
          gridLengthInBars={gridLengthInBars}
          hasError={trackErrors.some((e) => e.trackId === track.id)}
          onToggle={(bar: number, isActive: boolean) =>
            toggleTrack(track, bar, isActive)
          }
          onShowMenu={showMenu}
          menu={menu}
          onMenuItemClick={handleMenuItemClick}
          closeMenu={closeMenu}
        />
      ))}
    </>
  );
};

const GridTracks = memo(GridTracksComponent);
GridTracks.displayName = "GridTracks";

export default GridTracks;
