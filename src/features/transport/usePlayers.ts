import { useCallback, useEffect, useRef } from "react";
import * as Tone from "tone";

import {
  type AudioTrack,
  type Duration,
  type PlayerChannel,
  type PlayerEQ,
  type Track,
} from "@/types";
import {
  barsToEndTime,
  calcVolumeLevel,
  cleanPosition,
  isPositionZero,
  positionDiff,
  toPosition,
} from "@/utils";
import { useTransportRead } from "./useTransportRead";
import usePositionStore from "../position/usePositionStore";
import useStackIdStore from "../stacks/useStackIdStore";
import useTracksStore from "../track/useTracksStore";

const usePlayers = (tracks: Track[]) => {
  const stackId = useStackIdStore((state) => state.stackId);
  const { transport, isLoading, isError } = useTransportRead(stackId);

  const playersRef = useRef<Tone.Players | null>(null);
  const channelsRef = useRef<PlayerChannel[]>([]);
  const eqsRef = useRef<PlayerEQ[]>([]);
  const pitchShiftsRef = useRef<
    { trackId: string; pitchShift: Tone.PitchShift }[]
  >([]);
  const eventIds = useRef<number[]>([]);

  const { stopPosition } = usePositionStore();
  const { addTrackError, eq, volume } = useTracksStore();

  const { isLoop, loopEnd, loopStart } = transport || {};

  const setupPlayer = useCallback(
    async (id: string, downloadUrl: string | null | undefined) => {
      if (!playersRef.current?.has(id)) {
        try {
          await new Promise<void>((resolve, reject) => {
            const source = downloadUrl ?? undefined;

            if (!source) {
              reject(new Error(`No source provided for track ID: ${id}`));
              return;
            }

            if (playersRef.current) {
              playersRef.current.add(id, source, () => {
                resolve();
              });
            }
          });
        } catch (error) {
          console.error(`Failed to set up player for track ID: ${id}`, error);
          addTrackError({
            trackId: id,
            message: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    },
    [addTrackError],
  );

  const setupAudioDurations = useCallback(
    (audioTrack: AudioTrack, duration: Duration, player: Tone.Player) => {
      const { start, stop } = duration;
      const trackOffsetSeconds = audioTrack.offset;
      const trackDurationSeconds = audioTrack.duration;
      const timestretch = audioTrack.timestretch;
      const adjustedLoopLength = audioTrack.loopLength / timestretch;

      for (
        let subLoopStart = start;
        subLoopStart < stop;
        subLoopStart += adjustedLoopLength
      ) {
        let transportOffset: number | string = "0:0:0";
        let startPosition: number | string = toPosition(subLoopStart);
        let subLoopEnd = subLoopStart + adjustedLoopLength;

        if (stop < subLoopEnd) {
          subLoopEnd = stop;
        }

        if (!isLoop) {
          const [bars] = (stopPosition?.toString() ?? "0:0:0").split(":");
          if (
            !isPositionZero(stopPosition ?? "0:0:0") &&
            subLoopStart <= Number(bars) &&
            subLoopEnd > Number(bars)
          ) {
            startPosition = cleanPosition(stopPosition ?? "0:0:0");
            transportOffset = positionDiff(
              startPosition,
              `${subLoopStart}:0:0`,
            );
          }
        }

        if (isLoop) {
          if (subLoopEnd >= loopEnd) {
            subLoopEnd = loopEnd;
          }
          if (subLoopStart < loopStart && subLoopEnd > loopStart) {
            startPosition = toPosition(loopStart);
            transportOffset = toPosition(loopStart - subLoopStart);
          }
        }

        eventIds.current.push(
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

        eventIds.current.push(
          Tone.getTransport().schedule((time) => {
            const adjustedStopTime =
              trackOffsetSeconds < 0
                ? time + Math.abs(trackOffsetSeconds)
                : time;
            player.stop(adjustedStopTime);
          }, barsToEndTime(subLoopEnd)),
        );
      }
    },
    [isLoop, loopEnd, loopStart, stopPosition],
  );

  const stopAndClearAll = () => {
    if (playersRef.current) {
      playersRef.current.stopAll();
      tracks.forEach((track) => {
        if (track.type === "audio" && playersRef.current?.has(track.id)) {
          const player = playersRef.current.player(track.id);
          if (player) {
            player.stop();
          }
        }
      });
    }
    Tone.getTransport().pause();
    eventIds.current.forEach((id) => Tone.getTransport().clear(id));
    eventIds.current.splice(0, eventIds.current.length);
  };

  useEffect(() => {
    if (!playersRef.current) {
      playersRef.current = new Tone.Players().toDestination();
    }

    if (!tracks || isLoading || isError || !stackId) {
      return;
    }

    eventIds.current.forEach((id) => Tone.getTransport().clear(id));
    eventIds.current.length = 0;

    const soloTracks = tracks.filter((t) => t.isSolo);

    const setupAllTracks = async () => {
      for (const track of tracks) {
        if (track.type === "audio" && track.audioTrack) {
          const audioTrack = track.audioTrack;
          const { id, downloadUrl } = audioTrack;

          await setupPlayer(id, downloadUrl);

          let player: Tone.Player | undefined;
          try {
            player = playersRef.current?.player(id);
          } catch {
            addTrackError({ trackId: id, message: "Player not found" });
            continue;
          }

          if (player) {
            player.volume.value = calcVolumeLevel(track.volumePercent);
            player.mute = track.isMute;

            if (
              soloTracks.length &&
              !soloTracks.find((t) => t.id === track.id)
            ) {
              player.mute = true;
            }

            const safeAudioTrack: AudioTrack = {
              ...audioTrack,
              downloadUrl: audioTrack.downloadUrl ?? undefined,
            };

            track.durations.forEach((duration) =>
              setupAudioDurations(safeAudioTrack, duration, player),
            );
          }
        }
      }
    };

    setupAllTracks();

    return () => {
      pitchShiftsRef.current.forEach(({ pitchShift }) => pitchShift.dispose());
      pitchShiftsRef.current = [];
    };
  }, [
    tracks,
    isLoading,
    isError,
    stackId,
    setupPlayer,
    setupAudioDurations,
    addTrackError,
  ]);

  useEffect(() => {
    if (volume && playersRef.current?.has(volume.trackId)) {
      const player = playersRef.current.player(volume.trackId);
      const track = tracks.find((t) => t.id === volume.trackId);
      const soloTracks = tracks.filter((t) => t.isSolo);
      const isSolo =
        soloTracks.length && !soloTracks.find((t) => t.id === track?.id);
      if (
        player &&
        track &&
        track.type === "audio" &&
        !track.isMute &&
        !isSolo
      ) {
        player.volume.value = calcVolumeLevel(volume.volumePercent);
      }
    }
  }, [volume, tracks]);

  useEffect(() => {
    const currentEQ =
      eq && eqsRef.current?.find((c) => c.track.id === eq.trackId)?.eq;
    if (currentEQ) {
      currentEQ.set({ ...eq });
    }
  }, [eq]);

  return {
    channels: channelsRef.current,
    players: playersRef.current,
    stopAndClearAll,
  };
};

export default usePlayers;
