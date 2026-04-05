import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useStack } from "@/features/stacks/hooks/useStackRead";

export const Route = createFileRoute(
  "/_authenticated/stacks/$stackId/add-track/",
)({
  component: AddTrackPage,
});

function AddTrackPage() {
  const { stackId } = Route.useParams();
  const navigate = useNavigate();
  const { data: stack } = useStack(stackId);

  const handleCreateAudio = () => {
    navigate({
      to: "/stacks/$stackId/library/$trackId",
      params: { stackId, trackId: "new" },
    });
  };

  const handleCreateSampler = () => {
    navigate({
      to: "/stacks/$stackId/library/$trackId",
      params: { stackId, trackId: "new" },
      search: { type: "sampler" },
    });
  };

  if (!stack) {
    return (
      <div className="h-full flex items-center justify-center bg-neutral-950 text-neutral-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-full bg-neutral-950 flex flex-col p-4">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <h1 className="text-2xl font-semibold text-white mb-1">Add Track</h1>
        <p className="text-neutral-400 mb-8 text-sm">Choose track type</p>

        <div className="space-y-4">
          <button
            onClick={handleCreateAudio}
            className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 p-5 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">🎵</div>
              <div>
                <div className="font-medium text-white">Audio Track</div>
                <div className="text-xs text-neutral-400 mt-0.5">
                  Load a sample from library
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={handleCreateSampler}
            className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 p-5 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">⌨️</div>
              <div>
                <div className="font-medium text-white">Sampler Track</div>
                <div className="text-xs text-neutral-400 mt-0.5">
                  Piano roll sequencing
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <button
        onClick={() => navigate({ to: `/stacks/${stackId}` })}
        className="mt-8 text-neutral-400 hover:text-white text-sm py-2"
      >
        Cancel
      </button>
    </div>
  );
}
