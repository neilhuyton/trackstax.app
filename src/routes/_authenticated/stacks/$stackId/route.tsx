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
import { useEffect } from "react";
import * as Tone from "tone";
import useTransportStore from "@/features/transport/hooks/useTransportStore";
import { usePlayersStore } from "@/features/transport/hooks/usePlayersStore";
import { useTransportRead } from "@/features/transport/hooks/useTransportRead";
import { useTrackRead } from "@/features/track/hooks/useTrackRead";
import { toClientTracks } from "@/features/utils/track-utils";
import { useQueryClient } from "@tanstack/react-query";
import SamplerPlayer from "@/features/grid/SamplerPlayer";

export const Route = createFileRoute("/_authenticated/stacks/$stackId")({
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

  const localTracks = useTracksStore((state) => state.tracks);
  const setTracks = useTracksStore((state) => state.setTracks);

  const { stopAndClearAll, setupAllTracks } = usePlayersStore();
  const { transport } = useTransportRead(stackId);
  const { tracks: serverTracks } = useTrackRead(stackId);

  const isLoop = transport?.isLoop ?? false;
  const loopStart = transport?.loopStart ?? 0;
  const loopEnd = transport?.loopEnd ?? 0;

  useStackIdStore.setState({ stackId });

  useEffect(() => {
    if (!stackId) return;

    const storedStackId = useStackIdStore.getState().stackId;

    if (storedStackId !== stackId) {
      setTracks([]);
    }
  }, [stackId, setTracks]);

  useEffect(() => {
    if (serverTracks && serverTracks.length > 0 && localTracks.length === 0) {
      const typedTracks = toClientTracks(serverTracks);
      setTracks(typedTracks);
    }
  }, [serverTracks, setTracks, localTracks.length]);

  useEffect(() => {
    if (localTracks.length > 0 && stackId) {
      setupAllTracks(isLoop, loopStart, loopEnd);
    }
  }, [localTracks, stackId, setupAllTracks, isLoop, loopStart, loopEnd]);

  // Load master volume from DB once when entering a new stack
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
        // leave this comment here
      }
    };

    loadMasterVolume();
  }, [stackId, queryClient]);

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
