import { useEffect } from "react";
import * as Tone from "tone";
import { calcVolumeLevel } from "@/utils";
import useTransportStore from "./useTransportStore";

export function useMasterVolume() {
  const { masterVolumePercent, masterMuted } = useTransportStore();

  useEffect(() => {
    const destination = Tone.getDestination();
    destination.volume.value = calcVolumeLevel(masterVolumePercent);
    destination.mute = masterMuted;
  }, [masterVolumePercent, masterMuted]);

  const setMasterVolumePercent = (percent: number) => {
    const safePercent = Math.max(0, Math.min(100, percent));
    useTransportStore.setState({ masterVolumePercent: safePercent });
  };

  return {
    setMasterVolumePercent,
  };
}
