import { create } from "zustand";
import * as Tone from "tone";
import type { Track, PlayerChannel, Duration } from "@/types";
import {
  barsToEndTime,
  calcVolumeLevel,
  cleanPosition,
  isPositionZero,
  positionDiff,
  toPosition,
} from "@/utils";
import useTracksStore from "@/features/track/hooks/useTracksStore";
import useStackIdStore from "@/features/stacks/hooks/useStackIdStore";
import usePositionStore from "@/features/position/hooks/usePositionStore";
import useTransportStore from "./useTransportStore";

interface PlayersStore {
  playersRef: React.RefObject<Tone.Players | null>;
  channelsRef: React.RefObject<PlayerChannel[]>;
  eventIdsRef: React.RefObject<Map<string, number[]>>;
  stopAndClearAll: () => void;
  updateTrackSchedule: (
    trackId: string,
    toggledBar?: number,
    wasActive?: boolean,
  ) => void;
  setupAllTracks: (
    isLoop: boolean,
    loopStart: number,
    loopEnd: number,
  ) => Promise<void>;
  cleanup: () => void;
}

export const usePlayersStore = create<PlayersStore>(() => {
  const playersRef = { current: null as Tone.Players | null };
  const channelsRef = { current: [] as PlayerChannel[] };
  const eventIdsRef = { current: new Map<string, number[]>() };

  const stopAndClearAll = () => {
    const players = playersRef.current;
    const tracks = useTracksStore.getState().tracks;

    if (players) {
      players.stopAll();
      tracks.forEach((track) => {
        if (track.type === "audio" && players.has(track.id)) {
          const player = players.player(track.id);
          if (player) player.stop();
        }
      });
    }

    Tone.getTransport().pause();

    eventIdsRef.current.forEach((ids) => {
      ids.forEach((id) => Tone.getTransport().clear(id));
    });
    eventIdsRef.current.clear();
  };

  const getOrCreateChannel = (track: Track): Tone.Channel => {
    let channelEntry = channelsRef.current.find((c) => c.track.id === track.id);
    if (!channelEntry) {
      const channel = new Tone.Channel({
        pan: 0,
        mute: false,
        channelCount: 2,
      }).toDestination();
      channelEntry = { track, channel };
      channelsRef.current.push(channelEntry);
    }
    return channelEntry.channel;
  };

  const clearTrackEvents = (trackId: string) => {
    const ids = eventIdsRef.current.get(trackId) || [];
    ids.forEach((id) => {
      try {
        Tone.getTransport().clear(id);
      } catch {
        // fail silently
      }
    });
    eventIdsRef.current.delete(trackId);
  };

  const setupPlayer = async (
    id: string,
    downloadUrl: string | null | undefined,
  ) => {
    if (!playersRef.current) {
      playersRef.current = new Tone.Players().toDestination();
    }

    if (!playersRef.current.has(id) && downloadUrl) {
      await new Promise<void>((resolve) => {
        playersRef.current!.add(id, downloadUrl, () => resolve());
      });
    }
  };

  const setupAudioDurations = (
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

    if (!eventIdsRef.current.has(track.id)) {
      eventIdsRef.current.set(track.id, []);
    }

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
      }

      if (isLoop) {
        if (subLoopEnd >= loopEnd) subLoopEnd = loopEnd;
        if (subLoopStart < loopStart && subLoopEnd > loopStart) {
          startPosition = toPosition(loopStart);
          transportOffset = toPosition(loopStart - subLoopStart);
        }
      }

      const [currentPositionBar] = (
        cleanPosition(Tone.getTransport().position) ?? "0:0:0"
      ).split(":");

      if (
        lastClickedBar === Number(currentPositionBar) &&
        Number(currentPositionBar) >= subLoopStart &&
        Number(currentPositionBar) < subLoopEnd
      ) {
        playFromPosition = cleanPosition(
          Tone.getTransport().position ?? "0:0:0",
        );
      }

      if (playFromPosition) {
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
        }, playFromPosition);

        eventIdsRef.current.get(track.id)!.push(eventId);
      }

      const startEventId = Tone.getTransport().schedule((time) => {
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
      }, startPosition);

      eventIdsRef.current.get(track.id)!.push(startEventId);

      const endEventId = Tone.getTransport().schedule((time) => {
        const adjustedStopTime =
          trackOffsetSeconds < 0 ? time + Math.abs(trackOffsetSeconds) : time;
        player.stop(adjustedStopTime);
      }, barsToEndTime(subLoopEnd));

      eventIdsRef.current.get(track.id)!.push(endEventId);
    }
  };

  const updateTrackSchedule = (
    trackId: string,
    toggledBar?: number,
    wasActive?: boolean,
  ) => {
    const tracks = useTracksStore.getState().tracks;
    const track = tracks.find((t) => t.id === trackId);
    if (!track || track.type !== "audio" || !track.audioTrack) return;

    const transportState = useTransportStore.getState();
    const isLoop = transportState.isLoop;
    const loopStart = transportState.loopStart;
    const loopEnd = transportState.loopEnd;

    if (!playersRef.current || !playersRef.current.has(trackId)) {
      return;
    }

    const player = playersRef.current.player(trackId);

    clearTrackEvents(trackId);

    const isTurningOffMidPlay = toggledBar !== undefined && wasActive === true;

    if (isTurningOffMidPlay && Tone.getTransport().state === "started") {
      const currentPos = cleanPosition(Tone.getTransport().position ?? "0:0:0");
      const [currentBar] = currentPos.split(":");

      if (Number(currentBar) === toggledBar) {
        player.stop(Tone.now());
      }
    }

    const channel = getOrCreateChannel(track);
    const soloTracks = tracks.filter((t) => t.isSolo);
    const shouldMuteBySolo =
      soloTracks.length > 0 && !soloTracks.some((t) => t.id === trackId);
    const isMuted = track.isMute || shouldMuteBySolo;

    channel.volume.value = isMuted
      ? -Infinity
      : calcVolumeLevel(track.volumePercent);
    channel.mute = isMuted;

    track.durations.forEach((duration) =>
      setupAudioDurations(track, duration, player, isLoop, loopStart, loopEnd),
    );
  };

  const setupAllTracks = async (
    isLoop: boolean,
    loopStart: number,
    loopEnd: number,
  ) => {
    const { tracks } = useTracksStore.getState();
    const stackId = useStackIdStore.getState().stackId;
    if (!stackId) return;

    eventIdsRef.current.clear();

    const soloTracks = tracks.filter((t) => t.isSolo);

    if (!playersRef.current) {
      playersRef.current = new Tone.Players().toDestination();
    }

    for (const track of tracks) {
      if (track.type === "audio" && track.audioTrack) {
        const { downloadUrl } = track.audioTrack;

        await setupPlayer(track.id, downloadUrl);

        let player: Tone.Player | undefined;
        try {
          player = playersRef.current.player(track.id);
        } catch {
          // fail silently
        }

        if (!player) continue;

        const channel = getOrCreateChannel(track);

        if (player.output) {
          player.disconnect();
          player.connect(channel);
        }

        const shouldMuteBySolo =
          soloTracks.length > 0 && !soloTracks.some((t) => t.id === track.id);
        const isMuted = track.isMute || shouldMuteBySolo;

        channel.volume.value = isMuted
          ? -Infinity
          : calcVolumeLevel(track.volumePercent);
        channel.mute = isMuted;

        if (!eventIdsRef.current.has(track.id)) {
          eventIdsRef.current.set(track.id, []);
        }

        track.durations.forEach((duration) =>
          setupAudioDurations(
            track,
            duration,
            player,
            isLoop,
            loopStart,
            loopEnd,
          ),
        );
      }
    }
  };

  const cleanup = () => stopAndClearAll();

  return {
    playersRef,
    channelsRef,
    eventIdsRef,
    stopAndClearAll,
    updateTrackSchedule,
    setupAllTracks,
    cleanup,
  };
});
