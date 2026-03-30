import { useTransportRead } from "./useTransportRead";
import { useTransportControls } from "./useTransportControls";

import useStackIdStore from "../stacks/useStackIdStore";
import usePositionStore from "../position/usePositionStore";
import useTransportStore from "./useTransportStore";
import useTracksStore from "../track/useTracksStore";

import { Button } from "@/components/ui/button";
import { TransportButtonIcon } from "./ButtonIcon";

const TransportPlay = () => {
  const stackId = useStackIdStore((state) => state.stackId);

  const { transport, isError: transportError } = useTransportRead(stackId);

  const { tracks, isError: tracksError } = useTracksStore();
  const { stopPosition } = usePositionStore();
  const { isPlay, isForward, isBackward } = useTransportStore();

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

  return (
    <Button
      onClick={isPlay ? handleStop : handlePlay}
      title={isPlay ? "Pause" : "Play"}
    >
      <TransportButtonIcon isPlay={isPlay} isLoop={isLoop ?? false} />
    </Button>
  );
};

export default TransportPlay;
