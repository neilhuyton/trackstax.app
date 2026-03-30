import { useCallback, useEffect, useRef } from "react";
import * as Tone from "tone";

import { FaBackward } from "react-icons/fa6";

import { Button } from "@/components/ui/button";

import { backwardPosition } from "@/utils";
import { useTransportRead } from "./useTransportRead";
import usePositionStore from "../stores/position";
import useStackIdStore from "../stores/useStackIdStore";
import useTransportStore from "../stores/transport";

export const TransportBackward = () => {
  const stackId = useStackIdStore((state) => state.stackId);
  const { transport, isError } = useTransportRead(stackId);
  const { isBackward, setIsBackward } = useTransportStore();
  const { isLoop } = transport || {};
  const { position, setPosition, setStopPosition } = usePositionStore();
  const backwardIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const positionRef = useRef(position);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    if (isBackward) {
      setIsBackward(false);
    }
  }, [isBackward, setIsBackward]);

  const moveBackward = useCallback(() => {
    const currentPosition = positionRef.current;
    try {
      const newPosition = backwardPosition(currentPosition);
      if (newPosition === currentPosition) return;
      setIsBackward(true);
      setPosition(newPosition);
      setStopPosition(newPosition);
      Tone.getTransport().position = newPosition;
    } catch (error) {
      console.error("Error handling backward action:", error);
    }
  }, [setIsBackward, setPosition, setStopPosition]);

  const startMovingBackward = useCallback(() => {
    if (!backwardIntervalRef.current) {
      moveBackward();
      backwardIntervalRef.current = setInterval(() => {
        moveBackward();
      }, 100);
    }
  }, [moveBackward]);

  const stopMoving = useCallback(() => {
    if (backwardIntervalRef.current) {
      clearInterval(backwardIntervalRef.current);
      backwardIntervalRef.current = null;
    }
  }, []);

  if (isError) return null;

  return (
    <Button
      type="button"
      onMouseDown={startMovingBackward}
      onMouseUp={stopMoving}
      onMouseLeave={stopMoving}
      title="Back"
      disabled={isLoop}
    >
      <FaBackward data-testid="backward-icon" />
    </Button>
  );
};

export default TransportBackward;
