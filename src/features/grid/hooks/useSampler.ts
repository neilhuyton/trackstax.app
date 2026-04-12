import { useEffect, useRef, useState, useCallback } from "react";
import * as Tone from "tone";
import useTracksStore from "../../track/hooks/useTracksStore";
import { calcVolumeLevel } from "@/utils";
import type { Track } from "@/types";

export function useSampler(trackId: string, sampleUrl: string | null) {
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const channelRef = useRef<Tone.Channel | null>(null);

  const { tracks } = useTracksStore();

  const [isLoaded, setIsLoaded] = useState(false);

  // Cleanup
  useEffect(() => {
    return () => {
      samplerRef.current?.dispose();
      channelRef.current?.dispose();
    };
  }, [trackId]);

  // Create sampler
  useEffect(() => {
    samplerRef.current?.dispose();
    channelRef.current?.dispose();
    setIsLoaded(false);

    if (!sampleUrl || !trackId) return;

    const channel = new Tone.Channel({
      pan: 0,
      mute: false,
      channelCount: 2,
    }).toDestination();
    channelRef.current = channel;

    const sampler = new Tone.Sampler({
      urls: { C4: sampleUrl },
      curve: "linear",
      onload: () => setIsLoaded(true),
      onerror: (err) => console.error(`Sampler error for ${trackId}`, err),
    }).connect(channel);

    samplerRef.current = sampler;

    return () => {
      sampler.dispose();
      channel.dispose();
    };
  }, [sampleUrl, trackId]);

  // Apply envelope from this track's data
  useEffect(() => {
    const sampler = samplerRef.current;
    if (!sampler) return;

    const track = tracks.find((t: Track) => t.id === trackId);
    if (!track || track.type !== "sampler" || !track.samplerTrack) return;

    const attackMs = track.samplerTrack.attackMs;
    const releaseMs = track.samplerTrack.releaseMs;

    const finalAttack =
      typeof attackMs === "number" && attackMs >= 0 ? attackMs : 10;
    const finalRelease =
      typeof releaseMs === "number" && releaseMs >= 0 ? releaseMs : 200;

    sampler.attack = Math.max(0, Number(finalAttack) || 10) / 1000;
    sampler.release = Math.max(0.001, Number(finalRelease) || 200) / 1000;
  }, [tracks, trackId]);

  // Volume / mute handling
  useEffect(() => {
    const channel = channelRef.current;
    if (!channel) return;

    const track = tracks.find((t: Track) => t.id === trackId);
    if (!track || track.type !== "sampler") return;

    const soloTracks = tracks.filter((t: Track) => t.isSolo);
    const shouldMuteBySolo =
      soloTracks.length > 0 && !soloTracks.some((t: Track) => t.id === trackId);

    const isMuted = track.isMute || shouldMuteBySolo;

    channel.volume.value = isMuted
      ? -Infinity
      : calcVolumeLevel(track.volumePercent);
    channel.mute = isMuted;
  }, [tracks, trackId]);

  const trigger = useCallback(
    (note = "C4", duration = "8n", time?: number) => {
      const sampler = samplerRef.current;
      if (!sampler || !isLoaded) return;

      const track = tracks.find((t: Track) => t.id === trackId);
      const attackMs = track?.samplerTrack?.attackMs;
      const releaseMs = track?.samplerTrack?.releaseMs;

      const finalAttack =
        typeof attackMs === "number" && attackMs >= 0 ? attackMs : 10;
      const finalRelease =
        typeof releaseMs === "number" && releaseMs >= 0 ? releaseMs : 200;

      sampler.attack = Math.max(0, Number(finalAttack) || 10) / 1000;
      sampler.release = Math.max(0.001, Number(finalRelease) || 200) / 1000;

      sampler.triggerAttackRelease(note, duration, time);
    },
    [isLoaded, trackId, tracks],
  );

  return { trigger };
}
