import { createFileRoute } from "@tanstack/react-router";
import { TrackLibrary } from "@/features/library/Library";
import { useStack } from "@/features/stacks/hooks/useStackRead";
import useTracksStore from "@/features/track/hooks/useTracksStore";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/trpc";
import type { Sample } from "@/features/library/hooks/useSampleLibrary";
import type { SamplerZone, NoteName } from "@/types";
import { NOTE_NAMES } from "@/types";
import { createNewTrack } from "@/features/utils/track-utils";
import * as Tone from "tone";

export const Route = createFileRoute(
  "/_authenticated/stacks/$stackId/library/$trackId/",
)({
  component: StackLibraryPage,
});

function StackLibraryPage() {
  const { stackId, trackId } = Route.useParams();
  const { data: stack } = useStack(stackId);
  const { tracks, storeAddTrack, storeUpdateTrack } = useTracksStore();
  const userId = useAuthStore((s) => s.user?.id);
  const navigate = useNavigate();

  const createTrackMutation = useMutation(trpc.track.create.mutationOptions());
  const updateZonesMutation = useMutation(
    trpc.sampler.updateSample.mutationOptions(),
  );

  const searchParams = Route.useSearch() as {
    returnTo?: string;
    lowNote?: string;
    highNote?: string;
    mode?: string;
  };

  if (!stack || !userId) {
    return (
      <div className="p-8 text-center text-neutral-400">Loading library...</div>
    );
  }

  const handleSampleSelected = async (sample: Sample) => {
    // 1. ZONE CREATION FLOW (from SamplerZones)
    if (
      searchParams.returnTo === "sampler-zone" &&
      searchParams.lowNote &&
      searchParams.highNote
    ) {
      const lowIndex = NOTE_NAMES.indexOf(searchParams.lowNote as NoteName);
      const highIndex = NOTE_NAMES.indexOf(searchParams.highNote as NoteName);

      const finalLowNote =
        lowIndex < highIndex
          ? (searchParams.lowNote as NoteName)
          : (searchParams.highNote as NoteName);

      const finalHighNote =
        lowIndex < highIndex
          ? (searchParams.highNote as NoteName)
          : (searchParams.lowNote as NoteName);

      const samplerTrack = tracks.find((t) => t.id === trackId);

      if (!samplerTrack || !samplerTrack.samplerTrack) {
        console.error("Sampler track not found for zone creation");
        return;
      }

      const newZone: SamplerZone = {
        id: crypto.randomUUID(),
        sampleUrl: sample.downloadUrl,
        lowNote: finalLowNote,
        highNote: finalHighNote,
        rootNote: "C4", // root note will be selected in SamplerZones
      };

      const updatedZones = [
        ...(samplerTrack.samplerTrack.zones ?? []),
        newZone,
      ];

      const updatedTrack = {
        ...samplerTrack,
        samplerTrack: {
          ...samplerTrack.samplerTrack,
          zones: updatedZones,
        },
      };

      storeUpdateTrack(updatedTrack);

      await updateZonesMutation.mutateAsync({
        trackId,
        zones: updatedZones,
      });

      navigate({
        to: "/stacks/$stackId/sampler/$trackId",
        params: { stackId, trackId },
        replace: true,
      });
      return;
    }

    // 2. CREATE NEW SAMPLER TRACK
    if (trackId === "new" && searchParams.mode === "sampler") {
      const baseTrack = createNewTrack(
        null,
        null,
        tracks,
        stack,
        undefined,
        true,
      );

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
          zones: [], // ← explicitly include zones
        },
      };

      storeAddTrack(newTrack);

      navigate({
        to: "/stacks/$stackId/sampler/$trackId",
        params: { stackId: stack.id, trackId: created.id },
        replace: true,
      });
      return;
    }

    // 3. CREATE NEW AUDIO TRACK
    if (trackId === "new") {
      const safeDownloadUrl = sample.downloadUrl.replace(/#/g, "%23");

      const player = new Tone.Player();
      await player.load(safeDownloadUrl);
      const duration = player.buffer.duration;

      const baseTrack = createNewTrack(
        null,
        sample.downloadUrl,
        tracks,
        stack,
        undefined,
        false,
      );

      const created = await createTrackMutation.mutateAsync({
        stackId: stack.id,
        type: "audio",
        label: baseTrack.label,
        color: baseTrack.color,
        filename: sample.filename,
        downloadUrl: sample.downloadUrl,
        duration: duration,
        fullDuration: duration,
        loopLength: baseTrack.loopLength,
        offset: 0,
        pitch: 0,
        timestretch: 1,
      });

      const newTrack = {
        ...baseTrack,
        id: created.id,
        stackId: stack.id,
        createdAt: created.createdAt ?? new Date().toISOString(),
        updatedAt: created.updatedAt ?? new Date().toISOString(),
        audioTrack: {
          id: created.audioTrack?.id ?? crypto.randomUUID(),
          filename: sample.filename,
          downloadUrl: sample.downloadUrl,
          offset: 0,
          duration: duration,
          pitch: 0,
          timestretch: 1,
          fullDuration: duration,
          sampleId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        samplerTrack: null,
      };

      storeAddTrack(newTrack);

      navigate({
        to: "/stacks/$stackId",
        params: { stackId: stack.id },
        search: { page: 0 },
        replace: true,
      });
      return;
    }

    // Default fallback - close library
    navigate({
      to: "/stacks/$stackId",
      params: { stackId: stack.id },
      search: { page: 0 },
      replace: true,
    });
  };

  return (
    <div className="h-full overflow-hidden bg-neutral-950">
      <TrackLibrary userId={userId} onSampleSelected={handleSampleSelected} />
    </div>
  );
}
