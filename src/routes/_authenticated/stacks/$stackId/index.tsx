import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";
import useStackIdStore from "@/features/stacks/useStackIdStore";
import { trpc } from "@/trpc";

import GridContainer from "@/features/grid/GridContainer";
import { TransportSheet } from "@/features/transport/TransportSheet";
import { TrackListSheet } from "@/features/track/TrackListSheet";
import { TrackToolsSheet } from "@/features/track/TrackToolsSheet";
import ClientStackPage from "@/features/stacks/ClientStackPage";

export const Route = createFileRoute("/_authenticated/stacks/$stackId/")({
  loader: async ({ params, context: { queryClient } }) => {
    const sessionPromise = useAuthStore.getState().waitUntilReady();
    const timeout = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error("Auth loader timeout")), 8000),
    );

    let session;
    try {
      session = await Promise.race([sessionPromise, timeout]);
    } catch {
      session = null;
    }

    if (!session?.user?.id) {
      throw redirect({ to: "/login" });
    }

    try {
      await queryClient.ensureQueryData(
        trpc.stack.getById.queryOptions({ id: params.stackId }),
      );
    } catch {
      // leave this in
    }

    return { session };
  },

  component: StackDetailPage,
});

function StackDetailPage() {
  const { stackId } = Route.useParams();

  if (stackId) {
    useStackIdStore.setState({ stackId });
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#1a1a1a]">
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        <TrackListSheet />

        <div className="flex-1 min-h-0 overflow-hidden">
          <GridContainer />
        </div>

        <TrackToolsSheet />
      </div>

      <TransportSheet />
      <ClientStackPage stackId={stackId} />
    </div>
  );
}
