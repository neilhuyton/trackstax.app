import { useEffect, useRef, useState, useCallback } from "react";
import * as Tone from "tone";
import useTracksStore from "../../track/hooks/useTracksStore";
import { useSamplerEnvelopeStore } from "../../sampler/hooks/useSamplerEnvelopeStore";
import { calcVolumeLevel } from "@/utils";

export function useSampler(trackId: string, sampleUrl: string | null) {
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const channelRef = useRef<Tone.Channel | null>(null);

  const { tracks } = useTracksStore();
  const { attackMs, releaseMs } = useSamplerEnvelopeStore();

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    return () => {
      samplerRef.current?.dispose();
      channelRef.current?.dispose();
    };
  }, [trackId]);

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
      urls: { C3: sampleUrl },
      curve: "linear",
      onload: () => setIsLoaded(true),
      onerror: (err) => console.error(`Sampler failed for ${trackId}`, err),
    }).connect(channel);

    samplerRef.current = sampler;

    return () => {
      sampler.dispose();
      channel.dispose();
    };
  }, [sampleUrl, trackId]);

  useEffect(() => {
    const sampler = samplerRef.current;
    if (!sampler) return;
    sampler.attack = Math.max(0, Number(attackMs) || 10) / 1000;
    sampler.release = Math.max(0.001, Number(releaseMs) || 200) / 1000;
  }, [attackMs, releaseMs]);

  useEffect(() => {
    const channel = channelRef.current;
    if (!channel) return;

    const track = tracks.find((t) => t.id === trackId);
    if (!track || track.type !== "sampler") return;

    const soloTracks = tracks.filter((t) => t.isSolo);
    const shouldMuteBySolo =
      soloTracks.length > 0 && !soloTracks.some((t) => t.id === trackId);

    const isMuted = track.isMute || shouldMuteBySolo;

    channel.volume.value = isMuted
      ? -Infinity
      : calcVolumeLevel(track.volumePercent);
    channel.mute = isMuted;
  }, [tracks, trackId]);

  const trigger = useCallback(
    (note = "C3", duration = "8n", time?: number) => {
      if (!samplerRef.current || !isLoaded) return;
      samplerRef.current.triggerAttackRelease(note, duration, time);
    },
    [isLoaded],
  );

  return { trigger };
}
