import { createFileRoute } from "@tanstack/react-router";
import PianoRollViewer from "@/features/sampler/PianoRollViewer";
import useTracksStore from "@/features/track/hooks/useTracksStore";
import { useSamplerPatternRead } from "@/features/grid/hooks/useSamplerPatternRead";
import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";
import { useSampler } from "@/features/grid/hooks/useSampler";

const PianoRollPage = () => {
  const { trackId } = Route.useParams();
  const { tracks } = useTracksStore();

  const samplerTrack = tracks?.find(
    (t) => t.id === trackId && t.type === "sampler",
  );

  const { pattern } = useSamplerPatternRead(trackId);

  const { trigger } = useSampler("/samples/43.wav");

  const updatePatternMutation = useMutation(
    trpc.sampler.updatePattern.mutationOptions(),
  );

  const handleAddNote = (time: string, note: string, duration = "16n") => {
    const newPattern = [...pattern, { time, note, duration }];
    updatePatternMutation.mutate({ trackId, pattern: newPattern });
  };

  const handleRemoveNote = (time: string, note: string) => {
    const newPattern = pattern.filter(
      (p) => !(p.time === time && p.note === note),
    );
    updatePatternMutation.mutate({ trackId, pattern: newPattern });
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
      pattern={pattern}
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
