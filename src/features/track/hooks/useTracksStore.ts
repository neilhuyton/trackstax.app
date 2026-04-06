import type { Track } from "@/types";
import { create } from "zustand";

interface TrackError {
  trackId: string;
  message: string;
}

interface Volume {
  volumePercent: number;
  trackId: string;
}

interface Eq {
  low: number;
  mid: number;
  high: number;
  lowFrequency: number;
  highFrequency: number;
  isBypass: boolean;
  trackId: string;
}

interface TracksStore {
  trackErrors: TrackError[];
  volume: Volume;
  eq: Eq;
  tracks: Track[];
  isLoading: boolean;
  isError: boolean;
  setTrackErrors: (trackErrors: TrackError[]) => void;
  setVolume: (volume: Volume) => void;
  setEq: (eq: Eq) => void;
  setTracks: (tracks: Track[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsError: (isError: boolean) => void;
  addTrackError: (error: TrackError) => void;
  storeAddTrack: (track: Track) => void;
  storeUpdateTrack: (track: Track) => void;
  storeDeleteTrack: (id: string) => void;
  storeDeleteTracks: (tracksToDelete: Track[]) => void;
}

const useTracksStore = create<TracksStore>((set) => ({
  trackErrors: [],
  volume: { volumePercent: 0, trackId: "" },
  eq: {
    low: 0,
    mid: 0,
    high: 0,
    lowFrequency: 0,
    highFrequency: 0,
    isBypass: true,
    trackId: "",
  },
  tracks: [],
  isLoading: false,
  isError: false,
  setTrackErrors: (trackErrors) => set({ trackErrors }),
  setVolume: (volume) => set({ volume }),
  setEq: (eq) => set({ eq }),
  setTracks: (tracks) =>
    set((state) => ({
      tracks: tracks ?? state.tracks,
    })),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsError: (isError) => set({ isError }),
  addTrackError: (error) =>
    set((state) => ({
      trackErrors: [...state.trackErrors, error],
      tracks: state.tracks.map((t) =>
        t.id === error.trackId ? { ...t, error: error.message } : t,
      ),
    })),
  storeAddTrack: (track) =>
    set((state) => ({
      tracks: [...state.tracks, track],
    })),
  storeUpdateTrack: (track: Track) =>
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === track.id ? { ...track } : t)),
      volume: {
        volumePercent: track.volumePercent,
        trackId: track.id,
      },
    })),
  storeDeleteTrack: (id) =>
    set((state) => ({
      tracks: state.tracks.filter((t) => t.id !== id),
    })),
  storeDeleteTracks: (tracksToDelete) =>
    set((state) => ({
      tracks: state.tracks.filter(
        (t) => !tracksToDelete.some((t2) => t.id === t2.id),
      ),
    })),
}));

export default useTracksStore;
