import type { Track } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { useStack } from "@/features/stacks/hooks/useStackRead";
import useStackIdStore from "@/features/stacks/hooks/useStackIdStore";
import SamplerToolbar from "./SamplerToolbar";
import SamplerEnvelopeControl from "./SamplerEnvelopeControl";
import { useSamplerEnvelopeStore } from "./hooks/useSamplerEnvelopeStore";
import useTracksStore from "@/features/track/hooks/useTracksStore";
import { useCallback, useEffect } from "react";
import { useTRPC } from "@/trpc";
import { useDebouncedMutation } from "./hooks/useDebouncedMutation";
import SamplerKeyboard from "./SamplerKeyboard";

type Props = {
  trackId: string;
  samplerTrack: Track;
  trigger?: (note: string, duration?: string) => void;
};

export default function SamplerAdmin({
  trackId,
  samplerTrack,
  trigger,
}: Props) {
  const stackId = useStackIdStore((state) => state.stackId);
  const { data: stack } = useStack(stackId);
  const userId = useAuthStore((s) => s.user?.id);

  const { tracks, storeUpdateTrack } = useTracksStore();

  const { attackMs, releaseMs, setAttack, setRelease } =
    useSamplerEnvelopeStore();

  const trpc = useTRPC();

  const updateEnvelopeMutation = useDebouncedMutation(
    trpc.sampler.updateEnvelope.mutationOptions(),
    400,
  );

  useEffect(() => {
    if (samplerTrack?.samplerTrack) {
      const st = samplerTrack.samplerTrack;
      if (typeof st.attackMs === "number" && st.attackMs >= 0) {
        setAttack(st.attackMs);
      }
      if (typeof st.releaseMs === "number" && st.releaseMs >= 0) {
        setRelease(st.releaseMs);
      }
    }
  }, [samplerTrack, setAttack, setRelease]);

  const handleAttackChange = useCallback(
    (value: number) => {
      const safeValue = Math.max(0, value);
      setAttack(safeValue);

      const currentTrack = tracks?.find((t) => t.id === trackId);
      if (currentTrack && currentTrack.samplerTrack) {
        const updatedTrack = {
          ...currentTrack,
          samplerTrack: {
            ...currentTrack.samplerTrack,
            attackMs: safeValue,
          },
        };
        storeUpdateTrack(updatedTrack);
      }

      updateEnvelopeMutation.mutate({
        trackId,
        attackMs: safeValue,
        releaseMs,
      });
    },
    [
      setAttack,
      updateEnvelopeMutation,
      trackId,
      releaseMs,
      tracks,
      storeUpdateTrack,
    ],
  );

  const handleReleaseChange = useCallback(
    (value: number) => {
      const safeValue = Math.max(0, value);
      setRelease(safeValue);

      const currentTrack = tracks?.find((t) => t.id === trackId);
      if (currentTrack && currentTrack.samplerTrack) {
        const updatedTrack = {
          ...currentTrack,
          samplerTrack: {
            ...currentTrack.samplerTrack,
            releaseMs: safeValue,
          },
        };
        storeUpdateTrack(updatedTrack);
      }

      updateEnvelopeMutation.mutate({
        trackId,
        attackMs,
        releaseMs: safeValue,
      });
    },
    [
      setRelease,
      updateEnvelopeMutation,
      trackId,
      attackMs,
      tracks,
      storeUpdateTrack,
    ],
  );

  const sampleFilename = samplerTrack?.samplerTrack?.sampleUrl
    ? samplerTrack.samplerTrack.sampleUrl.split("/").pop() || "No sample"
    : "No sample loaded";

  if (!stack || !userId) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-400 bg-[#1a1a1a]">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a] overflow-hidden">
      <SamplerToolbar stackId={stackId} trackId={trackId} />

      <div className="flex-1 p-3 flex flex-col gap-3 overflow-hidden">
        <div className="bg-zinc-900 border border-neutral-700 rounded px-4 py-2 text-sm font-mono text-neutral-300 truncate">
          {sampleFilename}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SamplerEnvelopeControl
            label="ATTACK"
            min={0}
            max={2000}
            value={attackMs}
            onChange={handleAttackChange}
          />
          <SamplerEnvelopeControl
            label="RELEASE"
            min={0}
            max={3000}
            value={releaseMs}
            onChange={handleReleaseChange}
          />
        </div>

        <SamplerKeyboard
          trackId={trackId}
          stackId={stackId}
          trigger={trigger}
        />
      </div>
    </div>
  );
}
