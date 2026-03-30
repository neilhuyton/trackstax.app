import { useCallback, useEffect, useRef } from "react";
import * as Tone from "tone";

import { FaForward } from "react-icons/fa6";

import { Button } from "@/components/ui/button";

import { forwardPosition } from "@/utils";
import { useTransportRead } from "./useTransportRead";
import usePositionStore from "../position/usePositionStore";
import useStackIdStore from "../stacks/useStackIdStore";
import useTransportStore from "./useTransportStore";

export const TransportForward = () => {
  const stackId = useStackIdStore((state) => state.stackId);
  const { transport, isError } = useTransportRead(stackId);
  const { isForward, setIsForward } = useTransportStore();
  const { isLoop } = transport || {};
  const { position, setPosition, setStopPosition } = usePositionStore();
  const forwardIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const positionRef = useRef(position);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    if (isForward) {
      setIsForward(false);
    }
  }, [isForward, setIsForward]);

  const moveForward = useCallback(() => {
    const currentPosition = positionRef.current;
    try {
      const newPosition = forwardPosition(currentPosition);
      setIsForward(true);
      setPosition(newPosition);
      setStopPosition(newPosition);
      Tone.getTransport().position = newPosition;
    } catch (error) {
      console.error("Error handling forward action:", error);
    }
  }, [setIsForward, setPosition, setStopPosition]);

  const startMovingForward = useCallback(() => {
    if (!forwardIntervalRef.current) {
      moveForward();
      forwardIntervalRef.current = setInterval(() => {
        moveForward();
      }, 100);
    }
  }, [moveForward]);

  const stopMoving = useCallback(() => {
    if (forwardIntervalRef.current) {
      clearInterval(forwardIntervalRef.current);
      forwardIntervalRef.current = null;
    }
  }, []);

  if (isError) return null;

  return (
    <Button
      type="button"
      onMouseDown={startMovingForward}
      onMouseUp={stopMoving}
      onMouseLeave={stopMoving}
      title="Forward"
      disabled={isLoop}
    >
      <FaForward data-testid="forward-icon" />
    </Button>
  );
};

export default TransportForward;
