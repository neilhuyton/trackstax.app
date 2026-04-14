import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useStack } from "@/features/stacks/hooks/useStackRead";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/trpc";
import useTracksStore from "@/features/track/hooks/useTracksStore";
import { createNewTrack } from "@/features/utils/track-utils";

export const Route = createFileRoute(
  "/_authenticated/stacks/$stackId/add-track/",
)({
  component: AddTrackPage,
});

function AddTrackPage() {
  const { stackId } = Route.useParams();
  const navigate = useNavigate();
  const { data: stack } = useStack(stackId);

  const { storeAddTrack } = useTracksStore();

  const createTrackMutation = useMutation(trpc.track.create.mutationOptions());

  const handleCreateAudio = () => {
    navigate({
      to: "/stacks/$stackId/library/$trackId",
      params: { stackId, trackId: "new" },
      search: {
        page: 0,
        returnTo: undefined,
        lowNote: undefined,
        highNote: undefined,
        sampleUrl: undefined,
        filename: undefined,
      },
    });
  };

  const handleCreateSampler = async () => {
    if (!stack) return;

    const baseTrack = createNewTrack(
      null,
      null,
      useTracksStore.getState().tracks,
      stack,
      undefined,
      true,
    );

    try {
      const created = await createTrackMutation.mutateAsync({
        stackId: stack.id,
        type: "sampler",
        label: baseTrack.label,
        color: baseTrack.color,
      });

      const newTrack = {
        ...baseTrack,
        id: created.id,
        stackId: stack.id,
        createdAt: created.createdAt ?? new Date().toISOString(),
        updatedAt: created.updatedAt ?? new Date().toISOString(),
        samplerTrack: {
          pattern: [],
          attackMs: 10,
          releaseMs: 200,
          zones: [],
        },
        audioTrack: null,
      };

      storeAddTrack(newTrack);

      navigate({
        to: "/stacks/$stackId/sampler/$trackId",
        params: { stackId: stack.id, trackId: created.id },
        search: {
          page: 0,
          returnTo: undefined,
          sampleUrl: undefined,
          filename: undefined,
          lowNote: undefined,
          highNote: undefined,
        },
        replace: true,
      });
    } catch (error) {
      console.error("Failed to create sampler track:", error);
    }
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
