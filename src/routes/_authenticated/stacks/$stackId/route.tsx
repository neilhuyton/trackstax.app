import {
  createFileRoute,
  redirect,
  Outlet,
  useRouter,
} from "@tanstack/react-router";
import { TransportSheet } from "@/features/transport/TransportSheet";
import useStackIdStore from "@/features/stacks/hooks/useStackIdStore";
import { useAuthStore } from "@/store/authStore";
import { trpc } from "@/trpc";
import useTracksStore from "@/features/track/hooks/useTracksStore";
import { useEffect, useRef } from "react";
import * as Tone from "tone";
import useTransportStore from "@/features/transport/hooks/useTransportStore";
import { usePlayersStore } from "@/features/transport/hooks/usePlayersStore";
import { useTrackRead } from "@/features/track/hooks/useTrackRead";
import { useQueryClient } from "@tanstack/react-query";
import SamplerPlayer from "@/features/grid/SamplerPlayer";
import { toClientTracks } from "@/features/utils/prisma-transformer";
import { createNewTrack } from "@/features/utils/track-utils";
import { useMutation } from "@tanstack/react-query";
import type { Stack } from "@/types";

export const Route = createFileRoute("/_authenticated/stacks/$stackId")({
  validateSearch: (search: Record<string, unknown>) => ({
    page: typeof search.page === "number" ? search.page : 0,
    returnTo: search.returnTo as string | undefined,
    sampleUrl: search.sampleUrl as string | undefined,
    filename: search.filename as string | undefined,
    lowNote: search.lowNote as string | undefined,
    highNote: search.highNote as string | undefined,
  }),

  loader: async ({ params, context: { queryClient } }) => {
    const { stackId } = params;

    const authStore = useAuthStore.getState();
    if (!authStore.session?.user?.id) {
      const session = await authStore.waitUntilReady().catch(() => null);
      if (!session?.user?.id) {
        throw redirect({ to: "/login" });
      }
    }

    await queryClient
      .ensureQueryData(trpc.stack.getById.queryOptions({ id: stackId }))
      .catch(() => {});

    return { stackId };
  },

  component: StackLayout,
});

function StackLayout() {
  const { stackId } = Route.useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const searchParams = Route.useSearch();

  const localTracks = useTracksStore((state) => state.tracks);
  const setTracks = useTracksStore((state) => state.setTracks);
  const storeAddTrack = useTracksStore((state) => state.storeAddTrack);

  const { stopAndClearAll } = usePlayersStore();
  const { tracks: serverTracks } = useTrackRead(stackId);

  const createTrackMutation = useMutation(trpc.track.create.mutationOptions());

  // Prevent multiple executions when returning from library
  const hasProcessedReturn = useRef(false);

  useStackIdStore.setState({ stackId });

  // Handle audio track creation when returning from library
  useEffect(() => {
    const shouldProcess =
      searchParams.returnTo === "audio-track" &&
      searchParams.sampleUrl &&
      searchParams.filename &&
      !hasProcessedReturn.current;

    if (shouldProcess) {
      hasProcessedReturn.current = true;

      const createAudioTrack = async () => {
        try {
          const safeDownloadUrl = searchParams.sampleUrl!.replace(/#/g, "%23");

          const player = new Tone.Player();
          await player.load(safeDownloadUrl);
          const duration = player.buffer.duration;

          const stackData = await queryClient.ensureQueryData(
            trpc.stack.getById.queryOptions({ id: stackId }),
          );

          const baseTrack = createNewTrack(
            null,
            searchParams.sampleUrl!,
            localTracks,
            stackData as Stack,
            undefined,
            false,
          );

          const created = await createTrackMutation.mutateAsync({
            stackId,
            type: "audio",
            label: baseTrack.label,
            color: baseTrack.color,
            filename: searchParams.filename!,
            downloadUrl: searchParams.sampleUrl!,
            duration,
            fullDuration: duration,
            loopLength: baseTrack.loopLength,
            offset: 0,
            pitch: 0,
            timestretch: 1,
          });

          const newTrack = {
            ...baseTrack,
            id: created.id,
            stackId,
            createdAt: created.createdAt ?? new Date().toISOString(),
            updatedAt: created.updatedAt ?? new Date().toISOString(),
            audioTrack: {
              id: created.audioTrack?.id ?? crypto.randomUUID(),
              filename: searchParams.filename!,
              downloadUrl: searchParams.sampleUrl!,
              offset: 0,
              duration,
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

          // Clean URL
          router.navigate({
            to: "/stacks/$stackId",
            params: { stackId },
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
          console.error("Failed to create audio track:", error);
          hasProcessedReturn.current = false; // allow retry on error
        }
      };

      createAudioTrack();
    }
  }, [
    searchParams.returnTo,
    searchParams.sampleUrl,
    searchParams.filename,
    stackId,
    localTracks,
    storeAddTrack,
    createTrackMutation,
    router,
    queryClient,
  ]);

  // Reset the processed flag when stack changes
  useEffect(() => {
    hasProcessedReturn.current = false;
  }, [stackId]);

  // Reset local tracks when switching stacks
  useEffect(() => {
    if (!stackId) return;

    const storedStackId = useStackIdStore.getState().stackId;
    if (storedStackId !== stackId) {
      setTracks([]);
    }
  }, [stackId, setTracks]);

  // Load tracks from server
  useEffect(() => {
    if (serverTracks && serverTracks.length > 0 && localTracks.length === 0) {
      const typedTracks = toClientTracks(serverTracks);
      setTracks(typedTracks);
    }
  }, [serverTracks, setTracks, localTracks.length]);

  // Load master volume
  useEffect(() => {
    if (!stackId) return;

    const loadMasterVolume = async () => {
      try {
        const destination = await queryClient.ensureQueryData(
          trpc.destination.getByStackId.queryOptions({ stackId }),
        );
        if (destination?.volumePercent !== undefined) {
          useTransportStore.setState({
            masterVolumePercent: destination.volumePercent,
          });
        }
      } catch {
        // fail silently
      }
    };

    loadMasterVolume();
  }, [stackId, queryClient]);

  // Cleanup when leaving stack
  useEffect(() => {
    return () => {
      const nextPath = router.state.location.pathname;
      const isLeavingStack = !nextPath.startsWith(`/stacks/${stackId}`);

      if (isLeavingStack) {
        Tone.getTransport().stop();
        Tone.getTransport().cancel();
        Tone.getTransport().position = "0:0:0";
        stopAndClearAll();
        useTransportStore.setState({ isPlay: false });
      }
    };
  }, [router, stackId, stopAndClearAll]);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#1a1a1a]">
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <Outlet />
      </div>

      <SamplerPlayer />
      <TransportSheet />
    </div>
  );
}
