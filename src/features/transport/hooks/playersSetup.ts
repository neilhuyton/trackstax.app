import * as Tone from "tone";
import { usePlayersCore } from "./usePlayersCore";
import type { Track } from "@/types";

export const getOrCreateChannel = (track: Track): Tone.Channel => {
  const { channelsRef } = usePlayersCore.getState();
  let channelEntry = channelsRef.current.find((c) => c.track.id === track.id);

  if (!channelEntry) {
    const channel = new Tone.Channel({
      pan: 0,
      mute: false,
      channelCount: 2,
    }).toDestination();

    channelEntry = { track, channel };
    channelsRef.current.push(channelEntry);
  }
  return channelEntry.channel;
};

export const setupPlayer = async (
  id: string,
  downloadUrl: string | null | undefined,
): Promise<void> => {
  const { playersRef } = usePlayersCore.getState();

  if (!playersRef.current) {
    playersRef.current = new Tone.Players().toDestination();
  }

  if (!playersRef.current.has(id) && downloadUrl) {
    await new Promise<void>((resolve) => {
      playersRef.current!.add(id, downloadUrl, () => resolve());
    });
  }
};
