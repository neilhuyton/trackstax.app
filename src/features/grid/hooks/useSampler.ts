import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as Tone from "tone";
import useTracksStore from "../../track/hooks/useTracksStore";
import useSamplerEnvelopeStore from "../../sampler/hooks/useSamplerEnvelopeStore";
import { calcVolumeLevel } from "@/utils";

type SamplerTrackInfo = {
  id: string;
  isMute: boolean;
  isSolo: boolean;
  volumePercent: number;
};

export function useSampler(sampleUrl: string | null) {
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const channelRef = useRef<Tone.Channel | null>(null);

  const { tracks } = useTracksStore();
  const { attackMs, releaseMs } = useSamplerEnvelopeStore();

  const [isLoaded, setIsLoaded] = useState(false);

  const samplerTrackInfo = useMemo<SamplerTrackInfo | null>(() => {
    const samplerTrack = tracks.find((t) => t.type === "sampler");
    if (!samplerTrack) return null;

    return {
      id: samplerTrack.id,
      isMute: samplerTrack.isMute,
      isSolo: samplerTrack.isSolo,
      volumePercent: samplerTrack.volumePercent,
    };
  }, [tracks]);

  // Create / recreate sampler when sampleUrl or track info changes
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

    if (samplerTrackInfo) {
      applyVolumeToChannel(channel, samplerTrackInfo);
    }

    return () => {
      sampler.dispose();
      channel.dispose();
    };
  }, [sampleUrl, samplerTrackInfo]);

  // Update envelope whenever attack/release from store changes
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

  // Update volume/mute when track info changes
  useEffect(() => {
    const channel = channelRef.current;
    if (!channel || !samplerTrackInfo) return;

    applyVolumeToChannel(channel, samplerTrackInfo);
  }, [samplerTrackInfo]);

  // Stable trigger that always uses latest sampler and isLoaded
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

function applyVolumeToChannel(
  channel: Tone.Channel,
  track: SamplerTrackInfo,
): void {
  const { tracks } = useTracksStore.getState();
  const soloTracks = tracks.filter((t) => t.type === "sampler" || t.isSolo);
  const hasSolo = soloTracks.some((t) => t.isSolo);
  const isSoloed = soloTracks.some((t) => t.id === track.id && t.isSolo);

  const shouldMuteBySolo = hasSolo && !isSoloed;
  const isMuted = track.isMute || shouldMuteBySolo;

  const calculatedDb = isMuted
    ? -Infinity
    : calcVolumeLevel(track.volumePercent);

  channel.volume.value = calculatedDb;
  channel.mute = isMuted;
}
