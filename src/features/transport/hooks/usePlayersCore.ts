import { create } from "zustand";
import * as Tone from "tone";
import type { PlayerChannel } from "@/types";

export interface PlayersCore {
  playersRef: React.RefObject<Tone.Players | null>;
  channelsRef: React.RefObject<PlayerChannel[]>;
  eventIdsRef: React.RefObject<Map<string, number[]>>;
}

export const usePlayersCore = create<PlayersCore>(() => ({
  playersRef: { current: null as Tone.Players | null },
  channelsRef: { current: [] as PlayerChannel[] },
  eventIdsRef: { current: new Map<string, number[]>() },
}));
