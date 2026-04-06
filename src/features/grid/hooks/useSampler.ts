import { useEffect, useRef, useState, useCallback } from "react";
import * as Tone from "tone";
import useTracksStore from "../../track/hooks/useTracksStore";
import useSamplerEnvelopeStore from "../../sampler/hooks/useSamplerEnvelopeStore";
import { calcVolumeLevel } from "@/utils";

export function useSampler(sampleUrl: string | null) {
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const channelRef = useRef<Tone.Channel | null>(null);

  const { tracks } = useTracksStore();
  const { attackMs, releaseMs } = useSamplerEnvelopeStore();

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    samplerRef.current?.dispose();
    channelRef.current?.dispose();

    samplerRef.current = null;
    channelRef.current = null;
    setIsLoaded(false);

    if (!sampleUrl) return;

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
      onerror: (err) => console.error("Sampler load failed:", sampleUrl, err),
    }).connect(channel);

    samplerRef.current = sampler;

    return () => {
      sampler.dispose();
      channel.dispose();
    };
  }, [sampleUrl]);

  // Update attack/release from envelope store
  useEffect(() => {
    const sampler = samplerRef.current;
    if (!sampler) return;

    const safeAttack = Number.isFinite(attackMs)
      ? Math.max(0, attackMs) / 1000
      : 0.01;

    const safeRelease = Number.isFinite(releaseMs)
      ? Math.max(0.001, releaseMs) / 1000
      : 0.2;

    sampler.attack = safeAttack;
    sampler.release = safeRelease;
    sampler.curve = "linear";
  }, [attackMs, releaseMs]);

  // Master volume + solo logic
  useEffect(() => {
    const channel = channelRef.current;
    if (!channel) return;

    const samplerTrack = tracks.find((t) => t.type === "sampler");
    if (!samplerTrack) return;

    const soloTracks = tracks.filter((t) => t.isSolo);
    const shouldMuteBySolo =
      soloTracks.length > 0 &&
      !soloTracks.some((t) => t.id === samplerTrack.id);

    const isMuted = samplerTrack.isMute || shouldMuteBySolo;

    channel.volume.value = isMuted
      ? -Infinity
      : calcVolumeLevel(samplerTrack.volumePercent);
    channel.mute = isMuted;
  }, [tracks]);

  const trigger = useCallback(
    (note: string = "C3", duration: string = "8n", time?: number) => {
      const sampler = samplerRef.current;
      if (!sampler || !isLoaded) return;

      sampler.triggerAttackRelease(note, duration, time);
    },
    [isLoaded],
  );

  return {
    isLoaded,
    trigger,
    channel: channelRef.current,
  };
}
