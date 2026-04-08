// src/features/transport/Play.tsx
import useStackIdStore from "../stacks/hooks/useStackIdStore";
import usePositionStore from "../position/hooks/usePositionStore";
import useTracksStore from "../track/hooks/useTracksStore";
import { Button } from "@/components/ui/button";
import { TransportButtonIcon } from "./ButtonIcon";
import { useTransportControls } from "./hooks/useTransportControls";
import { useTransportRead } from "./hooks/useTransportRead";
import useTransportStore from "./hooks/useTransportStore";
import { usePlayersStore } from "./hooks/usePlayersStore";

const TransportPlay = () => {
  const stackId = useStackIdStore((state) => state.stackId);

  const { transport, isError: transportError } = useTransportRead(stackId);
  const { tracks, isError: tracksError } = useTracksStore();
  const { stopPosition } = usePositionStore();
  const { isPlay, isForward, isBackward } = useTransportStore();

  const { stopAndClearAll, setupAllTracks } = usePlayersStore();

  const isAnyError = tracksError || transportError;

  const { isLoop, loopStart, loopEnd } = transport || {};

  const { handlePlay, handleStop } = useTransportControls({
    tracks,
    isLoop: isLoop ?? false,
    loopStart: loopStart ?? 0,
    loopEnd: loopEnd ?? 0,
    stopPosition: stopPosition != null ? stopPosition.toString() : null,
    isPlay,
    isForward,
    isBackward,
  });

  if (!stackId || isAnyError) {
    return null;
  }

  const onClick = async () => {
    if (isPlay) {
      stopAndClearAll();
      handleStop();
    } else {
      // Re-setup audio scheduling BEFORE starting playback
      if (isLoop !== undefined && loopStart !== undefined && loopEnd !== undefined) {
        await setupAllTracks(isLoop, loopStart, loopEnd);
      }
      handlePlay();
    }
  };

  return (
    <Button
      onClick={onClick}
      title={isPlay ? "Pause" : "Play"}
    >
      <TransportButtonIcon isPlay={isPlay} isLoop={isLoop ?? false} />
    </Button>
  );
};

export default TransportPlay;