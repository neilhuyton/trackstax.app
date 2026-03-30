import * as Tone from "tone";

import { FaFastBackward } from "react-icons/fa";

import { Button } from "@/components/ui/button";

import { toPosition } from "@/utils";
import { useTransportRead } from "./useTransportRead";
import usePositionStore from "../stores/position";
import useStackIdStore from "../stores/useStackIdStore";
import useTransportStore from "../stores/transport";

export const TransportReset = () => {
  const stackId = useStackIdStore((state) => state.stackId);
  const { setPosition, setStopPosition } = usePositionStore();
  const { transport, isError } = useTransportRead(stackId);
  const { isPlay, setIsReset } = useTransportStore();

  const handleReset = () => {
    Tone.getTransport().stop();

    const position = transport?.isLoop
      ? toPosition(transport.loopStart)
      : "0:0:0";
    setIsReset(true);
    setPosition(position);
    setStopPosition(position);
    Tone.getTransport().position = position;
    if (isPlay) {
      Tone.getTransport().start();
    }
  };

  if (isError) return null;

  return (
    <Button onClick={handleReset} title="Reset" aria-label="Reset">
      <FaFastBackward />
    </Button>
  );
};

export default TransportReset;
