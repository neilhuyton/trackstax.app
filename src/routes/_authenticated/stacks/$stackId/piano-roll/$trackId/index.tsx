import { createFileRoute } from "@tanstack/react-router";
import PianoRollViewer from "@/features/sampler/PianoRollViewer";
import useTracksStore from "@/features/track/hooks/useTracksStore";
import { useSampler } from "@/features/grid/hooks/useSampler";
import { useMemo, useRef } from "react";
import type { SamplerEvent } from "@/types";

import PianoRollToolbar from "@/features/sampler/PianoRollToolbar";
import { useMidiImport } from "@/features/sampler/hooks/useMidiImport";
import { usePatternActions } from "@/features/sampler/hooks/usePatternActions";

const PianoRollPage = () => {
  const { trackId } = Route.useParams();
  const { tracks } = useTracksStore();

  const samplerTrack = tracks?.find(
    (t) => t.id === trackId && t.type === "sampler",
  );

  const currentPattern = useMemo<SamplerEvent[]>(
    () => samplerTrack?.samplerTrack?.pattern ?? [],
    [samplerTrack?.samplerTrack?.pattern],
  );

  const sampleUrl = samplerTrack?.samplerTrack?.sampleUrl ?? null;
  const { trigger } = useSampler(trackId, sampleUrl);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // MIDI Import
  const { handleMidiLoad } = useMidiImport({
    samplerTrack,
    trackId,
  });

  // Pattern actions (add / remove / update)
  const { handleAddNote, handleRemoveNote } = usePatternActions({
    samplerTrack,
    currentPattern,
    trackId,
  });

  if (!samplerTrack) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-400 bg-[#1a1a1a]">
        Sampler track not found
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#1a1a1a] relative">
      <PianoRollToolbar onMidiLoadClick={() => fileInputRef.current?.click()} />

      <div className="flex-1 overflow-hidden">
        <PianoRollViewer
          pattern={currentPattern}
          onAddNote={handleAddNote}
          onRemoveNote={handleRemoveNote}
          trigger={trigger}
          loopLength={samplerTrack.loopLength}
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".mid,.midi"
        onChange={handleMidiLoad}
        className="hidden"
      />
    </div>
  );
};

export const Route = createFileRoute(
  "/_authenticated/stacks/$stackId/piano-roll/$trackId/",
)({
  component: PianoRollPage,
});

export default PianoRollPage;
