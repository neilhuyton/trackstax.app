import useStackIdStore from "../stacks/hooks/useStackIdStore";
import usePositionStore from "../position/hooks/usePositionStore";
import useTracksStore from "../track/hooks/useTracksStore";

import { Button } from "@/components/ui/button";
import { TransportButtonIcon } from "./ButtonIcon";
import { useTransportControls } from "./hooks/useTransportControls";
import { useTransportRead } from "./hooks/useTransportRead";
import useTransportStore from "./hooks/useTransportStore";

type SamplerEvent = {
  time: string;
  note: string;
  duration?: string;
};

const SAMPLER_PATTERN: SamplerEvent[] = [
  { time: "0:0:0", note: "D3", duration: "6n" },
  { time: "0:0:3", note: "D3", duration: "6n" },
  { time: "0:1:2", note: "D3", duration: "6n" },
  { time: "0:2:1", note: "D3", duration: "6n" },
  { time: "0:3:0", note: "D3", duration: "6n" },
  { time: "0:3:2", note: "E3", duration: "6n" },
  { time: "0:4:0", note: "D3", duration: "6n" },
  { time: "0:4:3", note: "D3", duration: "6n" },
  { time: "0:5:2", note: "D3", duration: "6n" },
  { time: "0:6:1", note: "D3", duration: "6n" },
  { time: "0:7:0", note: "D3", duration: "6n" },
  { time: "0:7:2", note: "B2", duration: "6n" },
];

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
    samplerPattern: SAMPLER_PATTERN,
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
