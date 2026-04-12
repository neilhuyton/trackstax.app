import { create } from "zustand";
import * as Tone from "tone";
import type { PlayerChannel } from "@/types";
import { usePlayersCore } from "./usePlayersCore";
import { stopAndClearAll, cleanup } from "./tracksCleanup";
import { updateTrackSchedule, setupAllTracks } from "./playersSchedule";

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
  const core = usePlayersCore.getState();

  return {
    playersRef: core.playersRef,
    channelsRef: core.channelsRef,
    eventIdsRef: core.eventIdsRef,

    stopAndClearAll,
    updateTrackSchedule,
    setupAllTracks,
    cleanup,
  };
});
