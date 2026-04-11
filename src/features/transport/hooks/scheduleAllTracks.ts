import * as Tone from "tone";
import { calcVolumeLevel } from "@/utils";
import { usePlayersCore } from "./usePlayersCore";
import { getOrCreateChannel, setupPlayer } from "./playersSetup";
import { setupAudioDurations } from "./scheduleAudioDurations";
import useTracksStore from "@/features/track/hooks/useTracksStore";
import useStackIdStore from "@/features/stacks/hooks/useStackIdStore";

export const setupAllTracks = async (
  isLoop: boolean,
  loopStart: number,
  loopEnd: number,
) => {
  const { tracks } = useTracksStore.getState();
  const stackId = useStackIdStore.getState().stackId;
  if (!stackId) return;

  const { playersRef, eventIdsRef } = usePlayersCore.getState();

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
