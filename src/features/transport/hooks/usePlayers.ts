import { useCallback, useEffect, useRef } from "react";
import * as Tone from "tone";

import {
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
import useStackIdStore from "@/features/stacks/hooks/useStackIdStore";
import usePositionStore from "@/features/position/hooks/usePositionStore";
import useTracksStore from "@/features/track/hooks/useTracksStore";

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

  // ====================== SETUP HELPERS ======================

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

  const getOrCreateChannel = useCallback((track: Track): Tone.Channel => {
    let channelEntry = channelsRef.current.find((c) => c.track.id === track.id);

    if (!channelEntry) {
      const channel = new Tone.Channel().toDestination();

      channelEntry = { track, channel };
      channelsRef.current.push(channelEntry);
    }

    return channelEntry.channel;
  }, []);

  const setupAudioDurations = useCallback(
    (track: Track, duration: Duration, player: Tone.Player) => {
      if (!track.audioTrack) return;

      const audioTrack = track.audioTrack;
      const { start, stop } = duration;
      const trackOffsetSeconds = audioTrack.offset;
      const trackDurationSeconds = audioTrack.duration;
      const timestretch = audioTrack.timestretch;
      const adjustedLoopLength = track.loopLength / timestretch;

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

  const stopAndClearAll = useCallback(() => {
    if (playersRef.current) {
      playersRef.current.stopAll();
      tracks.forEach((track) => {
        if (track.type === "audio" && playersRef.current?.has(track.id)) {
          const player = playersRef.current.player(track.id);
          if (player) player.stop();
        }
      });
    }
    Tone.getTransport().pause();
    eventIds.current.forEach((id) => Tone.getTransport().clear(id));
    eventIds.current.splice(0, eventIds.current.length);
  }, [tracks]);

  // ====================== MAIN SETUP EFFECT ======================

  useEffect(() => {
    if (!playersRef.current) {
      playersRef.current = new Tone.Players().toDestination();
    }

    if (!tracks || isLoading || isError || !stackId) {
      return;
    }

    // Clear previous events
    eventIds.current.forEach((id) => Tone.getTransport().clear(id));
    eventIds.current.length = 0;

    const soloTracks = tracks.filter((t) => t.isSolo);

    const setupAllTracks = async () => {
      for (const track of tracks) {
        if (track.type === "audio" && track.audioTrack) {
          const { id, downloadUrl } = track.audioTrack;

          await setupPlayer(id, downloadUrl);

          let player: Tone.Player | undefined;
          try {
            player = playersRef.current?.player(id);
          } catch {
            addTrackError({ trackId: id, message: "Player not found" });
            continue;
          }

          if (!player) continue;

          // === ROUTE PLAYER THROUGH CHANNEL ===
          const channel = getOrCreateChannel(track);

          // Disconnect player from destination and connect through channel
          if (player.output) {
            // Tone.Players internally manages connections — we chain: Player → Channel → Destination
            player.disconnect();
            player.connect(channel);
          }

          // === VOLUME, MUTE, SOLO via CHANNEL (NOT PLAYER) ===
          channel.volume.value = calcVolumeLevel(track.volumePercent);
          channel.mute = track.isMute;

          if (soloTracks.length && !soloTracks.some((t) => t.id === track.id)) {
            channel.mute = true;
          }

          // Setup scheduling (unchanged)
          track.durations.forEach((duration) =>
            setupAudioDurations(track, duration, player),
          );
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
    getOrCreateChannel,
  ]);

  // ====================== VOLUME UPDATES ======================

  useEffect(() => {
    if (!volume) return;

    const channelEntry = channelsRef.current.find(
      (c) => c.track.id === volume.trackId,
    );

    if (channelEntry) {
      const track = tracks.find((t) => t.id === volume.trackId);
      const soloTracks = tracks.filter((t) => t.isSolo);
      const isSoloMuted =
        soloTracks.length && !soloTracks.some((t) => t.id === track?.id);

      if (track && track.type === "audio" && !track.isMute && !isSoloMuted) {
        channelEntry.channel.volume.value = calcVolumeLevel(
          volume.volumePercent,
        );
      }
    }
  }, [volume, tracks]);

  // ====================== EQ UPDATES (unchanged) ======================

  useEffect(() => {
    const currentEQ = eqsRef.current?.find(
      (c) => c.track.id === eq?.trackId,
    )?.eq;

    if (currentEQ && eq) {
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
