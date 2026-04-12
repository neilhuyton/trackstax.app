import { ChevronDown } from "lucide-react";
import useTracksStore from "@/features/track/hooks/useTracksStore";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/trpc";
import type { Track } from "@/types";

type Props = {
  samplerTrack: Track | undefined;
  trackId: string;
};

export default function PianoRollLoopLengthSelect({
  samplerTrack,
  trackId,
}: Props) {
  const { storeUpdateTrack } = useTracksStore();

  const updateTrackMutation = useMutation(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    trpc.track.update.mutationOptions({
      onError: (error) => console.error("Failed to update track:", error),
    }),
  );

  const handleLoopLengthChange = (newLength: number) => {
    if (!samplerTrack) return;

    const updatedTrack = { ...samplerTrack, loopLength: newLength };
    storeUpdateTrack(updatedTrack);
    updateTrackMutation.mutate({ id: trackId, loopLength: newLength });
  };

  const currentLoopLength = samplerTrack?.loopLength ?? 4;

  return (
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
  );
}
