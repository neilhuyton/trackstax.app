import { createFileRoute } from "@tanstack/react-router";
import PianoRollViewer from "@/features/sampler/PianoRollViewer";
import useTracksStore from "@/features/track/hooks/useTracksStore";
import { useSampler } from "@/features/grid/hooks/useSampler";
import { useMemo } from "react";
import type { SamplerEvent } from "@/types";
import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";

import {
  addNoteToPattern,
  removeNoteFromPattern,
  getCurrentBar,
} from "@/features/sampler/utils/pianoRollUtils";

const PianoRollPage = () => {
  const { trackId } = Route.useParams();
  const { tracks, storeUpdateTrack } = useTracksStore();

  const samplerTrack = tracks?.find(
    (t) => t.id === trackId && t.type === "sampler",
  );

  const currentPattern = useMemo<SamplerEvent[]>(
    () => samplerTrack?.samplerTrack?.pattern ?? [],
    [samplerTrack?.samplerTrack?.pattern],
  );

  const { trigger } = useSampler("/samples/43.wav");

  const updatePatternMutation = useMutation(
    trpc.sampler.updatePattern.mutationOptions(),
  );

  // Helper: Update pattern both locally (optimistic) and on the server
  const updatePattern = (newPattern: SamplerEvent[]) => {
    if (!samplerTrack) return;

    const updatedTrack = {
      ...samplerTrack,
      samplerTrack: {
        ...samplerTrack.samplerTrack,
        pattern: newPattern,
      },
    };

    storeUpdateTrack(updatedTrack);
    updatePatternMutation.mutate({ trackId, pattern: newPattern });
  };

  const handleAddNote = (time: string, note: string, duration = "16n") => {
    const latestPattern = addNoteToPattern(
      currentPattern,
      time,
      note,
      duration,
    );
    updatePattern(latestPattern);
  };

  const handleRemoveNote = (time: string, note: string) => {
    const latestPattern = removeNoteFromPattern(currentPattern, time, note);
    updatePattern(latestPattern);
  };

  const currentBar = useMemo(() => getCurrentBar(), []);

  if (!samplerTrack) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-400 bg-[#1a1a1a]">
        Sampler track not found
      </div>
    );
  }

  return (
    <PianoRollViewer
      pattern={currentPattern}
      onAddNote={handleAddNote}
      onRemoveNote={handleRemoveNote}
      trigger={trigger}
      currentBar={currentBar}
    />
  );
};

export const Route = createFileRoute(
  "/_authenticated/stacks/$stackId/piano-roll/$trackId/",
)({
  component: PianoRollPage,
});

export default PianoRollPage;
