import { useMutation } from "@tanstack/react-query";
import * as Tone from "tone";
import {
  buildClientTrackFromServer,
  createNewTrack,
} from "@/utils/track-utils";
import { trpc } from "@/trpc";
import type { Track, Stack } from "@/types";
import useTracksStore from "./useTracksStore";
import type { Sample } from "./useSampleLibrary";

export function useLoadTrack(tracks: Track[], stack: Stack) {
  const { storeAddTrack } = useTracksStore();

  const createTrackMutation = useMutation(
    trpc.track.create.mutationOptions({
      onError: (error) => console.error("Failed to create track:", error),
    }),
  );

  const loadTrack = async (sample: Sample) => {
    const safeDownloadUrl = sample.downloadUrl.replace(/#/g, "%23");

    const player = new Tone.Player();
    await player.load(safeDownloadUrl);

    const duration = player.buffer.duration;
    const barDuration = Tone.TransportTime("1m").toSeconds();
    const loopLength = Math.max(1, Math.round(duration / barDuration));

    const baseTrack = createNewTrack(null, sample.downloadUrl, tracks, stack);

    const createdTrack = await createTrackMutation.mutateAsync({
      stackId: stack.id,
      type: "audio",
      label: baseTrack.label,
      color: baseTrack.color,
      filename: sample.filename,
      downloadUrl: sample.downloadUrl,
      duration,
      fullDuration: duration,
      loopLength,
      offset: 0,
      pitch: 0,
      timestretch: 1,
    });

    const newTrack = buildClientTrackFromServer(
      baseTrack,
      createdTrack,
      sample.filename,
      sample.downloadUrl,
      duration,
      loopLength,
    );

    storeAddTrack(newTrack);
    return newTrack;
  };

  return {
    loadTrack,
    isPending: createTrackMutation.isPending,
  };
}
