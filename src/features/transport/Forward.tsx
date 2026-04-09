import { useCallback, useEffect, useRef, useMemo } from "react";
import * as Tone from "tone";

import { FaForward } from "react-icons/fa6";

import { Button } from "@/components/ui/button";

import { forwardPosition } from "@/utils";
import usePositionStore from "../position/hooks/usePositionStore";
import useStackIdStore from "../stacks/hooks/useStackIdStore";
import { useTransportRead } from "./hooks/useTransportRead";
import useTransportStore from "./hooks/useTransportStore";
import { useNavigate } from "@tanstack/react-router";

const MAX_BARS = 200;
const pageSize = 8;

export const TransportForward = () => {
  const navigate = useNavigate();

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

  const isAtMax = useMemo(() => {
    const currentBar =
      typeof position === "string"
        ? parseInt(position.split(":")[0] || "0", 10)
        : 0;
    return currentBar >= MAX_BARS - 1;
  }, [position]);

  const moveForward = useCallback(() => {
    if (isAtMax) return;

    const currentPosition = positionRef.current;
    try {
      const newPosition = forwardPosition(currentPosition);

      const newBar =
        typeof newPosition === "string"
          ? parseInt(newPosition.split(":")[0] || "0", 10)
          : 0;

      if (newBar >= MAX_BARS) return;

      setIsForward(true);
      setPosition(newPosition);
      setStopPosition(newPosition);
      Tone.getTransport().position = newPosition;

      const targetPage = Math.floor(newBar / pageSize);

      navigate({
        to: ".",
        search: { page: targetPage },
        replace: true,
      });
    } catch {
      // fail silently
    }
  }, [setIsForward, setPosition, setStopPosition, navigate, isAtMax]);

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
      disabled={isLoop || isAtMax}
    >
      <FaForward data-testid="forward-icon" />
    </Button>
  );
};

export default TransportForward;
