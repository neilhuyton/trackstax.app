import * as Tone from "tone";
import { usePlayersCore } from "./usePlayersCore";
import useTracksStore from "@/features/track/hooks/useTracksStore";

export const stopAndClearAll = () => {
  const { playersRef, eventIdsRef } = usePlayersCore.getState();
  const tracks = useTracksStore.getState().tracks;

  const players = playersRef.current;

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

export const clearTrackEvents = (trackId: string) => {
  const { eventIdsRef } = usePlayersCore.getState();
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

export const cleanup = () => stopAndClearAll();
