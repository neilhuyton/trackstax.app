import * as Tone from "tone";
import { calcVolumeLevel, cleanPosition } from "@/utils";
import { usePlayersCore } from "./usePlayersCore";
import { clearAudioTrackEvents } from "./tracksCleanup";
import { getOrCreateChannel } from "./playersSetup";
import { setupAudioDurations } from "./playersScheduleAudioDurations";
import useTracksStore from "@/features/track/hooks/useTracksStore";
import useTransportStore from "./useTransportStore";

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

  clearAudioTrackEvents(trackId);

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
