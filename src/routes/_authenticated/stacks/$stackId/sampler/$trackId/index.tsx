import { createFileRoute } from "@tanstack/react-router";
import SamplerAdmin from "@/features/sampler/SamplerAdmin";
import useTracksStore from "@/features/track/hooks/useTracksStore";
import { useSampler } from "@/features/grid/hooks/useSampler";

const SamplerAdminPage = () => {
  const { trackId } = Route.useParams();

  const { tracks } = useTracksStore();

  const samplerTrack = tracks?.find(
    (t) => t.id === trackId && t.type === "sampler",
  );

  const sampleUrl = samplerTrack?.samplerTrack?.sampleUrl ?? null;
  const { trigger } = useSampler(trackId, sampleUrl);

  if (!samplerTrack) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-400 bg-[#1a1a1a]">
        Sampler track not found
      </div>
    );
  }

  return (
    <SamplerAdmin
      trackId={trackId}
      samplerTrack={samplerTrack}
      trigger={trigger}
    />
  );
};

export const Route = createFileRoute(
  "/_authenticated/stacks/$stackId/sampler/$trackId/",
)({
  component: SamplerAdminPage,
});

export default SamplerAdminPage;
