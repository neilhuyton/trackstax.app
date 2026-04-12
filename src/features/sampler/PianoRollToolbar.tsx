// src/features/sampler/PianoRollToolbar.tsx

import { useParams } from "@tanstack/react-router";
import useTracksStore from "@/features/track/hooks/useTracksStore";

import PianoRollBackButton from "./PianoRollBackButton";
import PianoRollLoopLengthSelect from "./PianoRollLoopLengthSelect";
import PianoRollMuteButton from "./PianoRollMuteButton";
import PianoRollLoadMidiButton from "./PianoRollLoadMidiButton";
import PianoRollOpenSamplerButton from "./PianoRollOpenSamplerButton";

export default function PianoRollToolbar() {
  const { trackId, stackId } = useParams({
    from: "/_authenticated/stacks/$stackId/piano-roll/$trackId/",
  });

  const { tracks } = useTracksStore();

  const samplerTrack = tracks?.find(
    (t) => t.id === trackId && t.type === "sampler",
  );

  return (
    <div className="h-10 flex items-center px-4 border-b border-neutral-800 bg-neutral-950">
      {/* Left side */}
      <div className="flex items-center gap-8">
        <PianoRollBackButton stackId={stackId} />

        <PianoRollLoopLengthSelect
          samplerTrack={samplerTrack}
          trackId={trackId}
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 ml-auto">
        <PianoRollMuteButton samplerTrack={samplerTrack} trackId={trackId} />

        <PianoRollLoadMidiButton trackId={trackId} />

        <PianoRollOpenSamplerButton trackId={trackId} stackId={stackId} />
      </div>
    </div>
  );
}
