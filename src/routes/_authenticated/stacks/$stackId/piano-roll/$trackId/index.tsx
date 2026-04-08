import { createFileRoute } from "@tanstack/react-router";
import PianoRollViewer from "@/features/sampler/PianoRollViewer";
import useTracksStore from "@/features/track/hooks/useTracksStore";
import { useSampler } from "@/features/grid/hooks/useSampler";
import { useMemo } from "react";
import type { SamplerEvent, Track } from "@/types";
import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";

import {
  addNoteToPattern,
  removeNoteFromPattern,
} from "@/features/sampler/utils/pianoRollUtils";

import PianoRollToolbar from "@/features/sampler/PianoRollToolbar";

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

  const sampleUrl = samplerTrack?.samplerTrack?.sampleUrl ?? null;
  const { trigger } = useSampler(sampleUrl);

  const updatePatternMutation = useMutation(
    trpc.sampler.updatePattern.mutationOptions(),
  );

  const updatePattern = (newPattern: SamplerEvent[]) => {
    if (!samplerTrack || !samplerTrack.samplerTrack) return;

    const updatedTrack: Track = {
      ...samplerTrack,
      samplerTrack: {
        pattern: newPattern,
        sampleUrl: samplerTrack.samplerTrack.sampleUrl ?? null,
        attackMs: samplerTrack.samplerTrack.attackMs ?? 10,
        releaseMs: samplerTrack.samplerTrack.releaseMs ?? 200,
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

  if (!samplerTrack) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-400 bg-[#1a1a1a]">
        Sampler track not found
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#1a1a1a] relative">
      <PianoRollToolbar />

      <div className="flex-1 overflow-hidden">
        <PianoRollViewer
          pattern={currentPattern}
          onAddNote={handleAddNote}
          onRemoveNote={handleRemoveNote}
          trigger={trigger}
        />
      </div>
    </div>
  );
};

export const Route = createFileRoute(
  "/_authenticated/stacks/$stackId/piano-roll/$trackId/",
)({
  component: PianoRollPage,
});

export default PianoRollPage;
