import { createFileRoute } from "@tanstack/react-router";
import { TrackLibraryDialog } from "@/features/library/LibraryDialog";
import { useStack } from "@/features/stacks/hooks/useStackRead";
import useTracksStore from "@/features/track/hooks/useTracksStore";
import { useAuthStore } from "@/store/authStore";

export const Route = createFileRoute("/_authenticated/stacks/$stackId/library")(
  {
    component: StackLibraryPage,
  },
);

function StackLibraryPage() {
  const { stackId } = Route.useParams();
  const { data: stack } = useStack(stackId);
  const { tracks } = useTracksStore();
  const userId = useAuthStore((s) => s.user?.id);

  if (!stack || !userId) {
    return <div className="p-8 text-center">Loading library...</div>;
  }

  return (
    <div className="h-full overflow-hidden bg-neutral-950">
      <TrackLibraryDialog userId={userId} tracks={tracks} stack={stack} />
    </div>
  );
}
