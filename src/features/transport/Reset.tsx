import * as Tone from "tone";
import { FaFastBackward } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { toPosition } from "@/utils";
import { useNavigate } from "@tanstack/react-router";

import usePositionStore from "../position/hooks/usePositionStore";
import useStackIdStore from "../stacks/hooks/useStackIdStore";
import { useTransportRead } from "./hooks/useTransportRead";
import useTransportStore from "./hooks/useTransportStore";

export const TransportReset = () => {
  const navigate = useNavigate();
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

    // Reset to first page in URL
    navigate({
      to: ".",
      search: { page: 0 },
      replace: true,
    });

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
