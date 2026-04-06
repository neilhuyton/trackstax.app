import type { Track } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { useStack } from "@/features/stacks/hooks/useStackRead";
import useStackIdStore from "@/features/stacks/hooks/useStackIdStore";
import SamplerToolbar from "./SamplerToolbar";
import SamplerZoneSelector from "./SamplerZoneSelector";
import SamplerEnvelopeControl from "./SamplerEnvelopeControl";
import useSamplerEnvelopeStore from "./hooks/useSamplerEnvelopeStore";
import useTracksStore from "@/features/track/hooks/useTracksStore";
import { useEffect, useCallback, useRef } from "react";
import { useTRPC } from "@/trpc";
import { useDebouncedMutation } from "./hooks/useDebouncedMutation";

type Props = {
  trackId: string;
  samplerTrack: Track;
};

export default function SamplerAdmin({ trackId, samplerTrack }: Props) {
  const stackId = useStackIdStore((state) => state.stackId);
  const { data: stack } = useStack(stackId);
  const userId = useAuthStore((s) => s.user?.id);

  const { tracks, storeUpdateTrack } = useTracksStore();

  const { attackMs, releaseMs, setAttack, setRelease, initFromTrack } =
    useSamplerEnvelopeStore();

  const trpc = useTRPC();

  const updateEnvelopeMutation = useDebouncedMutation(
    trpc.sampler.updateEnvelope.mutationOptions(),
    400,
  );

  const isUserDraggingRef = useRef(false);

  useEffect(() => {
    if (isUserDraggingRef.current) {
      return;
    }

    const st =
      samplerTrack?.samplerTrack ||
      tracks?.find((t) => t.id === trackId)?.samplerTrack;

    if (st) {
      const attack =
        typeof st.attackMs === "number" && st.attackMs >= 0 ? st.attackMs : 10;
      const release =
        typeof st.releaseMs === "number" && st.releaseMs >= 0
          ? st.releaseMs
          : 200;

      initFromTrack(attack, release);
    }
  }, [samplerTrack, tracks, trackId, initFromTrack]);

  const handleAttackChange = useCallback(
    (value: number) => {
      const safeValue = Math.max(0, value);

      isUserDraggingRef.current = true;
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

      setTimeout(() => {
        isUserDraggingRef.current = false;
      }, 600);
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

      isUserDraggingRef.current = true;
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

      setTimeout(() => {
        isUserDraggingRef.current = false;
      }, 600);
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

        <SamplerZoneSelector
          trackId={trackId}
          stackId={stackId}
          samplerTrack={samplerTrack}
        />
      </div>
    </div>
  );
}
