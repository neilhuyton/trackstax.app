import { useNavigate, useParams } from "@tanstack/react-router";
import { ChevronLeft, Music } from "lucide-react";
import useTracksStore from "@/features/track/hooks/useTracksStore";
import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";

const PianoRollToolbar = () => {
  const navigate = useNavigate();
  const { trackId, stackId } = useParams({
    from: "/_authenticated/stacks/$stackId/piano-roll/$trackId/",
  });

  const { tracks, storeUpdateTrack } = useTracksStore();

  const samplerTrack = tracks?.find(
    (t) => t.id === trackId && t.type === "sampler",
  );

  const updateTrackMutation = useMutation(trpc.track.update.mutationOptions());

  const handleBack = () => {
    navigate({
      to: "/stacks/$stackId",
      params: { stackId },
      search: { page: 0 },
      replace: true,
    });
  };

  const handleLoopLengthChange = (newLength: number) => {
    if (!samplerTrack) return;

    const updatedTrack = {
      ...samplerTrack,
      loopLength: newLength,
    };

    storeUpdateTrack(updatedTrack);

    updateTrackMutation.mutate({
      id: trackId,
      loopLength: newLength,
    });
  };

  const handleGoToSampler = () => {
    navigate({
      to: "/stacks/$stackId/sampler/$trackId",
      params: { stackId, trackId },
      replace: true,
    });
  };

  const currentLoopLength = samplerTrack?.loopLength ?? 4;

  return (
    <div className="h-10 flex items-center px-4 border-b border-neutral-800 bg-neutral-950">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mr-8"
      >
        <ChevronLeft className="h-5 w-5" />
        <span className="font-medium">Back to Grid</span>
      </button>

      <div className="flex items-center gap-3">
        <span className="text-sm text-neutral-400">Loop Length</span>
        <select
          value={currentLoopLength}
          onChange={(e) => handleLoopLengthChange(parseInt(e.target.value))}
          className="bg-neutral-900 border border-neutral-700 text-sm rounded px-3 py-1 focus:outline-none focus:border-neutral-600"
        >
          {Array.from({ length: 8 }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>
              {num} bar{num > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleGoToSampler}
        className="ml-auto flex items-center gap-2 px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded text-sm text-white transition-colors"
      >
        <Music className="h-4 w-4" />
        Open Sampler
      </button>
    </div>
  );
};

export default PianoRollToolbar;
