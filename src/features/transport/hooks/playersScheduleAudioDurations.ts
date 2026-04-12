import * as Tone from "tone";
import type { Track, Duration } from "@/types";
import {
  barsToEndTime,
  cleanPosition,
  isPositionZero,
  positionDiff,
  toPosition,
} from "@/utils";
import { usePlayersCore } from "./usePlayersCore";
import useTracksStore from "@/features/track/hooks/useTracksStore";
import usePositionStore from "@/features/position/hooks/usePositionStore";

const schedulePlayerStart = (
  player: Tone.Player,
  trackOffsetSeconds: number,
  transportOffset: number | string,
  trackDurationSeconds: number,
  scheduleTime: number | string,
  eventIds: number[],
) => {
  const eventId = Tone.getTransport().schedule((time) => {
    const transportOffsetSeconds =
      typeof transportOffset === "string"
        ? Tone.Time(transportOffset).toSeconds()
        : transportOffset;

    let playbackOffset = 0;
    let adjustedTime = time;

    if (trackOffsetSeconds < 0) {
      adjustedTime = time + Math.abs(trackOffsetSeconds);
    } else {
      playbackOffset = trackOffsetSeconds;
    }

    const totalOffset = playbackOffset + transportOffsetSeconds;
    player.start(adjustedTime, totalOffset, trackDurationSeconds);
  }, scheduleTime);

  eventIds.push(eventId);
};

export const setupAudioDurations = (
  track: Track,
  duration: Duration,
  player: Tone.Player,
  isLoop: boolean,
  loopStart: number,
  loopEnd: number,
) => {
  if (!track.audioTrack) return;

  const audioTrack = track.audioTrack;
  const { start, stop } = duration;
  const trackOffsetSeconds = audioTrack.offset;
  const trackDurationSeconds = audioTrack.duration;
  const loopLength = track.loopLength;

  const stopPosition = usePositionStore.getState().stopPosition;
  const lastClickedBar = useTracksStore.getState().lastClickedBar;

  const { eventIdsRef } = usePlayersCore.getState();

  if (!eventIdsRef.current.has(track.id)) {
    eventIdsRef.current.set(track.id, []);
  }

  const eventIds = eventIdsRef.current.get(track.id)!;

  for (
    let subLoopStart = start;
    subLoopStart < stop;
    subLoopStart += loopLength
  ) {
    let transportOffset: number | string = "0:0:0";
    let startPosition: number | string = toPosition(subLoopStart);
    let playFromPosition: number | string | undefined;

    let subLoopEnd = subLoopStart + loopLength;
    if (stop < subLoopEnd) subLoopEnd = stop;

    // Calculate transport offset for non-looping or looping cases
    if (!isLoop) {
      const [bars] = (stopPosition?.toString() ?? "0:0:0").split(":");
      if (
        !isPositionZero(stopPosition ?? "0:0:0") &&
        subLoopStart <= Number(bars) &&
        subLoopEnd > Number(bars)
      ) {
        startPosition = cleanPosition(stopPosition ?? "0:0:0");
        transportOffset = positionDiff(startPosition, `${subLoopStart}:0:0`);
      }
    } else {
      if (subLoopEnd >= loopEnd) subLoopEnd = loopEnd;
      if (subLoopStart < loopStart && subLoopEnd > loopStart) {
        startPosition = toPosition(loopStart);
        transportOffset = toPosition(loopStart - subLoopStart);
      }
    }

    // Check if we should play from current position (for seamless toggle)
    const [currentPositionBar] = (
      cleanPosition(Tone.getTransport().position) ?? "0:0:0"
    ).split(":");

    if (
      lastClickedBar === Number(currentPositionBar) &&
      Number(currentPositionBar) >= subLoopStart &&
      Number(currentPositionBar) < subLoopEnd
    ) {
      playFromPosition = cleanPosition(Tone.getTransport().position ?? "0:0:0");
    }

    // Schedule immediate play if we're in the middle of the bar that was just toggled
    if (playFromPosition) {
      schedulePlayerStart(
        player,
        trackOffsetSeconds,
        transportOffset,
        trackDurationSeconds,
        playFromPosition,
        eventIds,
      );
    }

    // Always schedule the normal start
    schedulePlayerStart(
      player,
      trackOffsetSeconds,
      transportOffset,
      trackDurationSeconds,
      startPosition,
      eventIds,
    );

    // Schedule the stop
    const endEventId = Tone.getTransport().schedule((time) => {
      const adjustedStopTime =
        trackOffsetSeconds < 0 ? time + Math.abs(trackOffsetSeconds) : time;
      player.stop(adjustedStopTime);
    }, barsToEndTime(subLoopEnd));

    eventIds.push(endEventId);
  }
};
