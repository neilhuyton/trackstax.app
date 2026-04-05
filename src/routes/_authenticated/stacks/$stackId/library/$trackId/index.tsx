import { createFileRoute } from "@tanstack/react-router";
import { TrackLibrary } from "@/features/library/Library";
import { useStack } from "@/features/stacks/hooks/useStackRead";
import useTracksStore from "@/features/track/hooks/useTracksStore";
import { useAuthStore } from "@/store/authStore";

export const Route = createFileRoute(
  "/_authenticated/stacks/$stackId/library/$trackId/",
)({
  component: StackLibraryPage,
});

function StackLibraryPage() {
  const { stackId, trackId } = Route.useParams();
  const { data: stack } = useStack(stackId);
  const { tracks } = useTracksStore();
  const userId = useAuthStore((s) => s.user?.id);

  const samplerTrack = tracks?.find(
    (t) => t.id === trackId && t.type === "sampler",
  );

  if (!stack || !userId) {
    return <div className="p-8 text-center">Loading library...</div>;
  }

  return (
    <div className="h-full overflow-hidden bg-neutral-950">
      <TrackLibrary
        userId={userId}
        tracks={tracks}
        stack={stack}
        trackId={trackId}
        samplerTrack={samplerTrack}
      />
    </div>
  );
}
