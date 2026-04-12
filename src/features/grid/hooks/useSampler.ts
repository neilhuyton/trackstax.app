import { useEffect, useRef, useState, useCallback } from "react";
import * as Tone from "tone";
import useTracksStore from "../../track/hooks/useTracksStore";
import { calcVolumeLevel } from "@/utils";
import type { Track } from "@/types";

export function useSampler(trackId: string) {
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const channelRef = useRef<Tone.Channel | null>(null);

  const { tracks } = useTracksStore();
  const [isLoaded, setIsLoaded] = useState(false);

  // Cleanup on unmount or trackId change
  useEffect(() => {
    return () => {
      samplerRef.current?.dispose();
      channelRef.current?.dispose();
    };
  }, [trackId]);

  // Create / recreate Sampler when track or zones change - TODO - THIS NEEDS FIXING - IT SHOULDN'T LOAD ZONES ON EVERY CHANGE
  useEffect(() => {
    samplerRef.current?.dispose();
    channelRef.current?.dispose();
    setIsLoaded(false);

    const track = tracks.find((t: Track) => t.id === trackId);
    if (!track || track.type !== "sampler" || !track.samplerTrack) return;

    const zones = track.samplerTrack.zones ?? [];
    if (zones.length === 0) return;

    const channel = new Tone.Channel({
      pan: 0,
      mute: false,
      channelCount: 2,
    }).toDestination();
    channelRef.current = channel;

    const urls: Record<string, string> = {};

    zones.forEach((zone) => {
      if (zone.rootNote && zone.sampleUrl) {
        urls[zone.rootNote] = zone.sampleUrl;
      }
    });

    if (Object.keys(urls).length === 0) return;

    const sampler = new Tone.Sampler({
      urls,
      curve: "linear",
      onload: () => setIsLoaded(true),
      onerror: (err) =>
        console.error(`Sampler load error for track ${trackId}`, err),
    }).connect(channel);

    samplerRef.current = sampler;

    return () => {
      sampler.dispose();
      channel.dispose();
    };
  }, [trackId, tracks]);

  // Update envelope (attack/release)
  useEffect(() => {
    const sampler = samplerRef.current;
    if (!sampler) return;

    const track = tracks.find((t: Track) => t.id === trackId);
    if (!track?.samplerTrack) return;

    sampler.attack = Math.max(0, (track.samplerTrack.attackMs ?? 10) / 1000);
    sampler.release = Math.max(
      0.001,
      (track.samplerTrack.releaseMs ?? 200) / 1000,
    );
  }, [tracks, trackId]);

  // Update mute / volume / solo logic
  useEffect(() => {
    const channel = channelRef.current;
    if (!channel) return;

    const track = tracks.find((t: Track) => t.id === trackId);
    if (!track || track.type !== "sampler") return;

    const soloTracks = tracks.filter((t: Track) => t.isSolo);
    const shouldMuteBySolo =
      soloTracks.length > 0 && !soloTracks.some((t) => t.id === trackId);

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

      sampler.triggerAttackRelease(note, duration, time);
    },
    [isLoaded],
  );

  return { trigger };
}
