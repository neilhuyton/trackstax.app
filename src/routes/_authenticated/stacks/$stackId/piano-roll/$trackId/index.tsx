import { createFileRoute } from "@tanstack/react-router";
import PianoRollViewer from "@/features/sampler/PianoRollViewer";
import useTracksStore from "@/features/track/hooks/useTracksStore";
import { useSamplerPatternRead } from "@/features/grid/hooks/useSamplerPatternRead";
import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";
import { useSampler } from "@/features/grid/hooks/useSampler";
import { useSamplerPatternStore } from "@/features/sampler/hooks/useSamplerPatternStore";
import { useEffect } from "react";
import type { SamplerEvent } from "@/types";

const PianoRollPage = () => {
  const { trackId } = Route.useParams();
  const { tracks } = useTracksStore();

  const samplerTrack = tracks?.find(
    (t) => t.id === trackId && t.type === "sampler",
  );

  const { pattern: serverPattern } = useSamplerPatternRead(trackId);
  const { trigger } = useSampler("/samples/43.wav");

  const { patterns, addNote, removeNote, setPattern } =
    useSamplerPatternStore();

  const currentPattern: SamplerEvent[] =
    patterns[trackId] ?? serverPattern ?? [];

  const updatePatternMutation = useMutation(
    trpc.sampler.updatePattern.mutationOptions(),
  );

  // Sync server data into local store
  useEffect(() => {
    if (serverPattern) {
      setPattern(trackId, serverPattern);
    }
  }, [serverPattern, trackId, setPattern]);

  const handleAddNote = (time: string, note: string, duration = "16n") => {
    addNote(trackId, time, note, duration);

    const latestPattern =
      useSamplerPatternStore.getState().patterns[trackId] ?? [];

    updatePatternMutation.mutate({ trackId, pattern: latestPattern });
  };

  const handleRemoveNote = (time: string, note: string) => {
    removeNote(trackId, time, note);

    const latestPattern =
      useSamplerPatternStore.getState().patterns[trackId] ?? [];

    updatePatternMutation.mutate({ trackId, pattern: latestPattern });
  };

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
    />
  );
};

export const Route = createFileRoute(
  "/_authenticated/stacks/$stackId/piano-roll/$trackId/",
)({
  component: PianoRollPage,
});

export default PianoRollPage;
