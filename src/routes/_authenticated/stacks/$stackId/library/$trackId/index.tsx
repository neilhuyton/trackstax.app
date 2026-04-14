import { createFileRoute } from "@tanstack/react-router";
import { TrackLibrary } from "@/features/library/Library";
import { useStack } from "@/features/stacks/hooks/useStackRead";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "@tanstack/react-router";
import type { Sample } from "@/features/library/hooks/useSampleLibrary";

export const Route = createFileRoute(
  "/_authenticated/stacks/$stackId/library/$trackId/",
)({
  validateSearch: (search: Record<string, unknown>) => ({
    returnTo: (search.returnTo as string | undefined) ?? undefined,
    lowNote: (search.lowNote as string | undefined) ?? undefined,
    highNote: (search.highNote as string | undefined) ?? undefined,
    sampleUrl: (search.sampleUrl as string | undefined) ?? undefined,
    page: typeof search.page === "number" ? search.page : 0,
    filename: (search.filename as string | undefined) ?? undefined,
  }),

  component: StackLibraryPage,
});

function StackLibraryPage() {
  const { stackId, trackId } = Route.useParams();
  const { data: stack } = useStack(stackId);
  const userId = useAuthStore((s) => s.user?.id);
  const navigate = useNavigate();

  const searchParams = Route.useSearch();

  if (!stack || !userId) {
    return (
      <div className="p-8 text-center text-neutral-400">Loading library...</div>
    );
  }

  const handleSampleSelected = async (sample: Sample) => {
    // 1. ZONE CREATION FLOW
    if (searchParams.returnTo === "sampler-zone") {
      navigate({
        to: "/stacks/$stackId/sampler/$trackId",
        params: { stackId, trackId },
        search: {
          page: 0,
          returnTo: "sampler-zone",
          sampleUrl: sample.downloadUrl,
          lowNote: searchParams.lowNote,
          highNote: searchParams.highNote,
          filename: undefined,
        },
        replace: true,
      });
      return;
    }

    // 2. AUDIO TRACK CREATION
    if (trackId === "new") {
      navigate({
        to: "/stacks/$stackId",
        params: { stackId },
        search: {
          page: 0,
          returnTo: "audio-track",
          sampleUrl: sample.downloadUrl,
          filename: sample.filename,
          lowNote: undefined,
          highNote: undefined,
        },
        replace: true,
      });
      return;
    }

    // Default fallback
    navigate({
      to: "/stacks/$stackId",
      params: { stackId: stack.id },
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
  };

  return (
    <div className="h-full overflow-hidden bg-neutral-950">
      <TrackLibrary userId={userId} onSampleSelected={handleSampleSelected} />
    </div>
  );
}
