import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc";
import { RouteError } from "@steel-cut/steel-lib";
import { useQuery } from "@tanstack/react-query";
import { useStackDelete } from "@/features/stacks/hooks/useStackDelete";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/stacks/$stackId/delete")({
  loader: async ({ context: { queryClient }, params }) => {
    const { stackId } = params;

    if (!stackId) return {};

    await queryClient.ensureQueryData(
      trpc.stack.getById.queryOptions(
        { id: stackId },
        { staleTime: 5 * 60 * 1000 },
      ),
    );

    return {};
  },

  pendingComponent: () => (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  ),
  pendingMs: 0,
  pendingMinMs: 300,

  errorComponent: ({ error, reset }) => (
    <RouteError
      error={error}
      reset={reset}
      title="Failed to load stack for deletion"
      backLabel="Back to Stacks"
    />
  ),

  component: DeleteStackConfirmPage,
});

function DeleteStackConfirmPage() {
  const { stackId } = Route.useParams();
  const navigate = Route.useNavigate();

  const { deleteStack, isDeleting } = useStackDelete();

  const [deleted, setDeleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stackQueryInput = { id: stackId ?? "" };

  const { data: stack, isPending: isStackPending } = useQuery(
    trpc.stack.getById.queryOptions(stackQueryInput, {
      staleTime: Infinity,
      gcTime: 30 * 60 * 1000,
      enabled: !!stackId && !deleted,
    }),
  );

  const handleCancel = () => {
    navigate({
      to: "/stacks",
      replace: true,
    });
  };

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stackId) return;

    setIsSubmitting(true);
    deleteStack(stackId, {
      onSuccess: () => {
        setDeleted(true);
        setIsSubmitting(false);
        navigate({ to: "/stacks", replace: true });
      },
      onError: () => {
        setIsSubmitting(false);
      },
    });
  };

  if (!stackId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        No stack ID provided.
      </div>
    );
  }

  if (isStackPending && !deleted && !isSubmitting) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (deleted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-center px-6">
        <div className="max-w-md space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Stack no longer exists
          </h1>
          <p className="text-lg text-muted-foreground">
            This stack has already been deleted or never existed.
          </p>
          <Button onClick={() => navigate({ to: "/stacks", replace: true })}>
            Back to Stacks
          </Button>
        </div>
      </div>
    );
  }

  const showConfirmation = !deleted && (stack || isSubmitting || isDeleting);

  if (!showConfirmation) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        Stack not found or you don't have access.
      </div>
    );
  }

  const stackTitle = stack?.title ?? "this stack";

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] isolate pointer-events-auto",
        "h-dvh w-dvw max-h-none max-w-none",
        "m-0 p-0 left-0 top-0 right-0 bottom-0 translate-x-0 translate-y-0",
        "rounded-none border-0 shadow-none",
        "bg-background overscroll-none touch-none",
      )}
    >
      <div className="relative flex min-h-full flex-col px-6 pt-20 pb-10 sm:px-8">
        <Button
          variant="outline"
          size="icon"
          className="absolute left-4 top-6 sm:left-6 sm:top-8 z-[10000]"
          aria-label="Cancel and return to stacks"
          onClick={handleCancel}
          disabled={isDeleting || isSubmitting}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="w-full max-w-2xl space-y-10">
            <div className="text-center space-y-4">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Delete "{stackTitle}"?
              </h1>
              <p className="text-lg text-muted-foreground">
                This action cannot be undone.
              </p>
            </div>

            <form
              onSubmit={handleDelete}
              className="space-y-8"
              data-testid="delete-confirm-form"
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isDeleting || isSubmitting}
                  className="w-full sm:w-44"
                  data-testid="delete-confirm-button"
                >
                  {(isDeleting || isSubmitting) && (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  )}
                  {isDeleting || isSubmitting ? "Deleting..." : "Delete Stack"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isDeleting || isSubmitting}
                  className="w-full sm:w-32"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
