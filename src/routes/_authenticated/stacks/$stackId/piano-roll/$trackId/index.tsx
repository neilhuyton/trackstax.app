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

  const { patterns, setPattern } = useSamplerPatternStore();

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
    const newEvent: SamplerEvent = {
      time,
      note: note as SamplerEvent["note"],
      duration,
    };

    const latestPattern = [...currentPattern, newEvent].sort((a, b) => {
      const [barA, beatA, sixteenthA] = a.time.split(":").map(Number);
      const [barB, beatB, sixteenthB] = b.time.split(":").map(Number);
      return barA - barB || beatA - beatB || sixteenthA - sixteenthB;
    });

    setPattern(trackId, latestPattern);

    updatePatternMutation.mutate({
      trackId,
      pattern: latestPattern,
    });
  };

  const handleRemoveNote = (time: string, note: string) => {
    const latestPattern = currentPattern.filter(
      (p) => !(p.time === time && p.note === note),
    );

    setPattern(trackId, latestPattern);

    updatePatternMutation.mutate({
      trackId,
      pattern: latestPattern,
    });
  };

  // New: Handle duration resize
  const handleUpdateDuration = (
    originalTime: string,
    note: string,
    newDuration: string,
  ) => {
    const updatedPattern = currentPattern.map((event) =>
      event.time === originalTime && event.note === note
        ? { ...event, duration: newDuration }
        : event,
    );

    setPattern(trackId, updatedPattern);

    updatePatternMutation.mutate({
      trackId,
      pattern: updatedPattern,
    });
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
      onUpdateDuration={handleUpdateDuration}
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
