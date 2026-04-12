import { useNavigate, useParams } from "@tanstack/react-router";
import { ChevronLeft, ChevronDown } from "lucide-react";
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

  const updateTrackMutation = useMutation(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    trpc.track.update.mutationOptions({
      onError: (error) => {
        console.error("Failed to update mute state:", error);
      },
    }),
  );

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

  const handleMuteToggle = () => {
    if (!samplerTrack) return;

    const newIsMute = !samplerTrack.isMute;

    const updatedTrack = {
      ...samplerTrack,
      isMute: newIsMute,
    };

    storeUpdateTrack(updatedTrack);

    updateTrackMutation.mutate({
      id: trackId,
      isMute: newIsMute,
    });
  };

  const currentLoopLength = samplerTrack?.loopLength ?? 4;
  const isMuted = samplerTrack?.isMute ?? false;

  return (
    <div className="h-10 flex items-center px-4 border-b border-neutral-800 bg-neutral-950">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mr-8 px-1 text-sm font-medium"
      >
        <ChevronLeft className="h-5 w-5" />
        <span className="font-medium">Back to Grid</span>
      </button>

      {/* Loop Length Selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-neutral-400">Loop Length</span>

        <div className="relative">
          <select
            value={currentLoopLength}
            onChange={(e) => handleLoopLengthChange(parseInt(e.target.value))}
            className="bg-neutral-900 border border-neutral-700 text-sm rounded px-3 py-0.5 pr-9 focus:outline-none focus:border-neutral-600 appearance-none cursor-pointer hover:border-neutral-600 transition-colors"
          >
            {Array.from({ length: 8 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num} bar{num > 1 ? "s" : ""}
              </option>
            ))}
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Mute Button */}
      <button
        onClick={handleMuteToggle}
        className={`ml-auto flex items-center gap-2 px-4 py-1 rounded text-sm transition-colors border ${
          isMuted
            ? "bg-red-950 border-red-600 text-red-400 hover:bg-red-900"
            : "bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800"
        }`}
        title={isMuted ? "Unmute track" : "Mute track"}
      >
        <span>{isMuted ? "Muted" : "Mute"}</span>
      </button>

      {/* Open Sampler Button */}
      <button
        onClick={() => {
          navigate({
            to: "/stacks/$stackId/sampler/$trackId",
            params: { stackId, trackId },
            replace: true,
          });
        }}
        className="ml-3 px-4 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded text-sm text-white transition-colors"
      >
        Sampler
      </button>
    </div>
  );
};

export default PianoRollToolbar;
