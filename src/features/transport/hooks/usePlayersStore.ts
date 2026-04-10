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
  eventIdsRef: React.RefObject<number[]>;
  stopAndClearAll: () => void;
  updateTrackSchedule: (trackId: string) => void;
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
  const eventIdsRef = { current: [] as number[] };

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
    eventIdsRef.current.forEach((id) => Tone.getTransport().clear(id));
    eventIdsRef.current.length = 0;
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

  const setupPlayer = async (
    id: string,
    downloadUrl: string | null | undefined,
  ) => {
    if (!playersRef.current?.has(id) && downloadUrl) {
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
    const timestretch = audioTrack.timestretch;
    const adjustedLoopLength = track.loopLength / timestretch;
    const stopPosition = usePositionStore.getState().stopPosition;

    for (
      let subLoopStart = start;
      subLoopStart < stop;
      subLoopStart += adjustedLoopLength
    ) {
      let transportOffset: number | string = "0:0:0";
      let startPosition: number | string = toPosition(subLoopStart);
      let subLoopEnd = subLoopStart + adjustedLoopLength;

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

      eventIdsRef.current.push(
        Tone.getTransport().schedule((time) => {
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
        }, startPosition),
      );

      eventIdsRef.current.push(
        Tone.getTransport().schedule((time) => {
          const adjustedStopTime =
            trackOffsetSeconds < 0 ? time + Math.abs(trackOffsetSeconds) : time;
          player.stop(adjustedStopTime);
        }, barsToEndTime(subLoopEnd)),
      );
    }
  };

  const updateTrackSchedule = (trackId: string) => {
    const tracks = useTracksStore.getState().tracks;
    const track = tracks.find((t) => t.id === trackId);
    if (!track || track.type !== "audio" || !track.audioTrack) return;

    const transportState = useTransportStore.getState();
    const isLoop = transportState.isLoop;
    const loopStart = transportState.loopStart;
    const loopEnd = transportState.loopEnd;

    const player = playersRef.current?.player(trackId);
    if (!player) return;

    eventIdsRef.current = eventIdsRef.current.filter((id) => {
      try {
        Tone.getTransport().clear(id);
        return false;
      } catch {
        // fail silently
        return true;
      }
    });

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
    const { tracks, addTrackError } = useTracksStore.getState();
    const stackId = useStackIdStore.getState().stackId;
    if (!stackId) return;

    eventIdsRef.current.forEach((id) => Tone.getTransport().clear(id));
    eventIdsRef.current.length = 0;

    const soloTracks = tracks.filter((t) => t.isSolo);

    if (!playersRef.current) {
      playersRef.current = new Tone.Players().toDestination();
    }

    for (const track of tracks) {
      if (track.type === "audio" && track.audioTrack) {
        const { id, downloadUrl } = track.audioTrack;

        await setupPlayer(id, downloadUrl);

        let player: Tone.Player | undefined;
        try {
          player = playersRef.current.player(id);
        } catch {
          // player lookup failed
          addTrackError({ trackId: id, message: "Player not found" });
          continue;
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
