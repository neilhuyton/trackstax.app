import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/trpc";
import useTracksStore from "@/features/track/hooks/useTracksStore";
import type { Track } from "@/types";

type Props = {
  samplerTrack: Track | undefined;
  trackId: string;
};

export default function PianoRollMuteButton({ samplerTrack, trackId }: Props) {
  const { storeUpdateTrack } = useTracksStore();

  const updateTrackMutation = useMutation(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    trpc.track.update.mutationOptions({
      onError: (error) => console.error("Failed to update mute state:", error),
    }),
  );

  const handleMuteToggle = () => {
    if (!samplerTrack) return;

    const newIsMute = !samplerTrack.isMute;
    const updatedTrack = { ...samplerTrack, isMute: newIsMute };

    storeUpdateTrack(updatedTrack);
    updateTrackMutation.mutate({ id: trackId, isMute: newIsMute });
  };

  const isMuted = samplerTrack?.isMute ?? false;

  return (
    <button
      onClick={handleMuteToggle}
      className={`px-4 py-1 rounded text-sm transition-colors border ${
        isMuted
          ? "bg-red-950 border-red-600 text-red-400 hover:bg-red-900"
          : "bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800"
      }`}
      title={isMuted ? "Unmute track" : "Mute track"}
    >
      {isMuted ? "Muted" : "Mute"}
    </button>
  );
}
