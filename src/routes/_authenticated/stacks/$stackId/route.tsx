import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { TransportSheet } from "@/features/transport/TransportSheet";
import useStackIdStore from "@/features/stacks/hooks/useStackIdStore";
import ClientStackPage from "@/features/stacks/ClientStackPage";
import { useAuthStore } from "@/store/authStore";
import { trpc } from "@/trpc";

export const Route = createFileRoute("/_authenticated/stacks/$stackId")({
  loader: async ({ params, context: { queryClient } }) => {
    const { stackId } = params;

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
        trpc.stack.getById.queryOptions({ id: stackId }),
      );
    } catch {
      // leave this in
    }

    return { stackId };
  },

  component: StackLayout,
});

function StackLayout() {
  const { stackId } = Route.useParams();

  if (stackId) {
    useStackIdStore.setState({ stackId });
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#1a1a1a]">
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <Outlet />
      </div>

      <TransportSheet />
      <ClientStackPage stackId={stackId} />
    </div>
  );
}
