import * as Tone from "tone";
import { calcVolumeLevel } from "@/utils";
import { usePlayersCore } from "./usePlayersCore";
import { clearAudioTrackEvents } from "./tracksCleanup";
import { getOrCreateChannel } from "./playersSetup";
import { setupAudioDurations } from "./playersScheduleAudioDurations";
import useTracksStore from "@/features/track/hooks/useTracksStore";
import useTransportStore from "./useTransportStore";
import { getCurrentTransportBar } from "@/features/utils/getCurrentBar";

export const updateTrackSchedule = (
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

  const { playersRef } = usePlayersCore.getState();

  if (!playersRef.current || !playersRef.current.has(trackId)) {
    return;
  }

  const player = playersRef.current.player(trackId);

  const isPlaying = Tone.getTransport().state === "started";
  let shouldReschedule = true;

  if (isPlaying && toggledBar !== undefined) {
    const currentBar = getCurrentTransportBar();
    if (toggledBar < currentBar) {
      shouldReschedule = false;
    }
  }

  if (shouldReschedule) {
    clearAudioTrackEvents(trackId);
  }

  const isTurningOffMidPlay = toggledBar !== undefined && wasActive === true;

  if (isTurningOffMidPlay && Tone.getTransport().state === "started") {
    const currentBar = getCurrentTransportBar();
    if (currentBar === toggledBar) {
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

  if (shouldReschedule) {
    track.durations.forEach((duration) =>
      setupAudioDurations(track, duration, player, isLoop, loopStart, loopEnd),
    );
  }
};
