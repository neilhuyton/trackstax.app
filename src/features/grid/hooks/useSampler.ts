import { useEffect, useRef, useState, useCallback } from "react";
import * as Tone from "tone";
import useTracksStore from "../../track/hooks/useTracksStore";
import { calcVolumeLevel } from "@/utils";

export function useSampler(sampleUrl: string | null) {
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const channelRef = useRef<Tone.Channel | null>(null);

  const { tracks } = useTracksStore();

  const [isLoaded, setIsLoaded] = useState(false);

  // Create sampler only when sampleUrl changes
  useEffect(() => {
    setIsLoaded(false);

    samplerRef.current?.dispose();
    channelRef.current?.dispose();

    samplerRef.current = null;
    channelRef.current = null;

    if (!sampleUrl) return;

    const channel = new Tone.Channel({
      pan: 0,
      mute: false,
      channelCount: 2,
    }).toDestination();

    channelRef.current = channel;

    const sampler = new Tone.Sampler({
      urls: { C3: sampleUrl },
      attack: 0,
      release: 1.2,
      curve: "linear",

      onload: () => setIsLoaded(true),
      onerror: () => console.error("Failed to load sample:", sampleUrl),
    }).connect(channel);

    samplerRef.current = sampler;

    return () => {
      sampler.dispose();
      channel.dispose();
    };
  }, [sampleUrl]);

  // Update volume/mute/solo - only when needed
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
