import { useRef } from "react";
import useTracksStore from "@/features/track/hooks/useTracksStore";
import { useMidiImport } from "./hooks/useMidiImport";

export default function PianoRollLoadMidiButton({
  trackId,
}: {
  trackId: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { tracks } = useTracksStore();
  const samplerTrack = tracks?.find(
    (t) => t.id === trackId && t.type === "sampler",
  );

  const { handleMidiLoad } = useMidiImport({
    samplerTrack,
    trackId,
  });

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="px-4 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded text-sm text-white transition-colors"
      >
        Load MIDI
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".mid,.midi"
        onChange={handleMidiLoad}
        className="hidden"
      />
    </>
  );
}
