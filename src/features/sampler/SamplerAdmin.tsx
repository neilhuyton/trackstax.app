import type { Track } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { useStack } from "@/features/stacks/hooks/useStackRead";
import useStackIdStore from "@/features/stacks/hooks/useStackIdStore";
import SamplerToolbar from "./SamplerToolbar";
import SamplerZoneSelector from "./SamplerZoneSelector";
import SamplerEnvelopeControl from "./SamplerEnvelopeControl";

type Props = {
  trackId: string;
  samplerTrack: Track;
};

export default function SamplerAdmin({ trackId, samplerTrack }: Props) {
  const stackId = useStackIdStore((state) => state.stackId);
  const { data: stack } = useStack(stackId);
  const userId = useAuthStore((s) => s.user?.id);

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
            defaultValue={10}
          />
          <SamplerEnvelopeControl
            label="RELEASE"
            min={0}
            max={3000}
            defaultValue={200}
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
