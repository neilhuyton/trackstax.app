import { useCallback, useEffect, useRef } from "react";
import * as Tone from "tone";

import { FaBackward } from "react-icons/fa6";

import { Button } from "@/components/ui/button";

import { backwardPosition } from "@/utils";
import usePositionStore from "../position/hooks/usePositionStore";
import useStackIdStore from "../stacks/hooks/useStackIdStore";
import { useTransportRead } from "./hooks/useTransportRead";
import useTransportStore from "./hooks/useTransportStore";
import { useNavigate, useSearch } from "@tanstack/react-router";

export const TransportBackward = () => {
  const navigate = useNavigate();
  const { page = 0 } = useSearch({ from: "/_authenticated/stacks/$stackId/" });

  const pageSize = 8;

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

      // Auto page backward if needed
      const currentBar =
        typeof newPosition === "string"
          ? parseInt(newPosition.split(":")[0] || "0", 10)
          : 0;

      const currentPage = page;
      const targetPage = Math.floor(currentBar / pageSize);

      if (targetPage < currentPage) {
        navigate({
          to: ".",
          search: { page: targetPage },
          replace: true,
        });
      }
    } catch (error) {
      console.error("Error handling backward action:", error);
    }
  }, [setIsBackward, setPosition, setStopPosition, page, navigate]);

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
