import type { Track } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { useStack } from "@/features/stacks/hooks/useStackRead";
import useStackIdStore from "@/features/stacks/hooks/useStackIdStore";
import SamplerToolbar from "./SamplerToolbar";
import SamplerEnvelopeControl from "./SamplerEnvelopeControl";
import useTracksStore from "@/features/track/hooks/useTracksStore";
import { useCallback, useEffect, useState } from "react";
import { useTRPC } from "@/trpc";
import { useDebouncedMutation } from "./hooks/useDebouncedMutation";
import SamplerKeyboard from "./SamplerKeyboard";
import SamplerZones from "./SamplerZones";

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

  const trpc = useTRPC();

  const updateEnvelopeMutation = useDebouncedMutation(
    trpc.sampler.updateEnvelope.mutationOptions(),
    400,
  );

  const [localAttack, setLocalAttack] = useState(
    samplerTrack?.samplerTrack?.attackMs ?? 10,
  );
  const [localRelease, setLocalRelease] = useState(
    samplerTrack?.samplerTrack?.releaseMs ?? 200,
  );

  const [isCreatingZone, setIsCreatingZone] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);

  useEffect(() => {
    if (samplerTrack?.samplerTrack) {
      const st = samplerTrack.samplerTrack;
      const newAttack =
        typeof st.attackMs === "number" && st.attackMs >= 0 ? st.attackMs : 10;
      const newRelease =
        typeof st.releaseMs === "number" && st.releaseMs >= 0
          ? st.releaseMs
          : 200;

      setLocalAttack(newAttack);
      setLocalRelease(newRelease);
    }
  }, [samplerTrack]);

  const handleAttackChange = useCallback(
    (value: number) => {
      const safeValue = Math.max(0, value);
      setLocalAttack(safeValue);

      const currentTrack = tracks?.find((t) => t.id === trackId);
      if (currentTrack && currentTrack.samplerTrack) {
        const updatedTrack: Track = {
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
        releaseMs: localRelease,
      });
    },
    [trackId, localRelease, tracks, storeUpdateTrack, updateEnvelopeMutation],
  );

  const handleReleaseChange = useCallback(
    (value: number) => {
      const safeValue = Math.max(0, value);
      setLocalRelease(safeValue);

      const currentTrack = tracks?.find((t) => t.id === trackId);
      if (currentTrack && currentTrack.samplerTrack) {
        const updatedTrack: Track = {
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
        attackMs: localAttack,
        releaseMs: safeValue,
      });
    },
    [trackId, localAttack, tracks, storeUpdateTrack, updateEnvelopeMutation],
  );

  const toggleNoteSelection = useCallback((note: string) => {
    setSelectedNotes((prev) =>
      prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note],
    );
  }, []);

  const clearZoneSelection = useCallback(() => {
    setSelectedNotes([]);
    setIsCreatingZone(false);
  }, []);

  // Updated: Show zone count instead of single sampleUrl
  const sampleFilename = samplerTrack?.samplerTrack?.zones?.length
    ? `${samplerTrack.samplerTrack.zones.length} zone(s) loaded`
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
            value={localAttack}
            onChange={handleAttackChange}
          />
          <SamplerEnvelopeControl
            label="RELEASE"
            min={0}
            max={3000}
            value={localRelease}
            onChange={handleReleaseChange}
          />
        </div>

        <SamplerZones
          trackId={trackId}
          isCreatingZone={isCreatingZone}
          setIsCreatingZone={setIsCreatingZone}
          selectedNotes={selectedNotes}
          clearZoneSelection={clearZoneSelection}
        />

        <SamplerKeyboard
          trackId={trackId}
          stackId={stackId}
          trigger={trigger}
          isCreatingZone={isCreatingZone}
          selectedNotes={selectedNotes}
          toggleNoteSelection={toggleNoteSelection}
        />
      </div>
    </div>
  );
}
