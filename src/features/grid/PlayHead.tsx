import React, { useCallback, useEffect, useRef } from "react";
import * as Tone from "tone";

import { PIXELS_PER_SIXTEENTH } from "@/consts";

import {
  isPositionZero,
  positionToSixteenths,
  roundPosition,
  toPosition,
} from "@/utils";
import { useTransportRead } from "../transport/useTransportRead";
import usePositionStore from "../position/hooks/usePositionStore";
import useStackIdStore from "../stacks/hooks/useStackIdStore";
import useTransportStore from "../transport/useTransportStore";
import useScreenStore from "../screen/hooks/useScreenStore";

const GridPlayHead = ({
  scrollAreaRef,
}: {
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const stackId = useStackIdStore((state) => state.stackId);
  const { transport } = useTransportRead(stackId);
  const { isBackward, isForward, isReset, isPlay, isRecord, setIsReset } =
    useTransportStore();
  const { isLoop, loopStart } = transport;

  const { position } = usePositionStore();

  const {
    gridWidth,
    scrollLeft,
    trackListWidth,
    trackToolsWidth,
    isScrollToPixel,
    setIsScrollGrid,
    setPlayheadPosition,
    setIsLoopReset,
  } = useScreenStore();

  const playHeadRef = useRef<HTMLDivElement | null>(null);
  const isUserScrollingRef = useRef(false);
  const hasScrolledToLoopStartRef = useRef(false);

  const movePlayHead = useCallback((duration: number, pixels: number) => {
    if (playHeadRef.current) {
      playHeadRef.current.style.transitionDuration = isUserScrollingRef.current
        ? "0s"
        : `${duration}s`;
      playHeadRef.current.style.transitionTimingFunction = "linear";
      playHeadRef.current.style.transform = `translate(${pixels}px)`;
    }
  }, []);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const handleScrollStart = () => {
      isUserScrollingRef.current = true;
    };
    const handleScrollEnd = () => {
      requestAnimationFrame(() => {
        isUserScrollingRef.current = false;
      });
    };

    scrollArea.addEventListener("scroll", handleScrollStart);
    scrollArea.addEventListener("scrollend", handleScrollEnd);

    return () => {
      scrollArea.removeEventListener("scroll", handleScrollStart);
      scrollArea.removeEventListener("scrollend", handleScrollEnd);
    };
  }, [scrollAreaRef]);

  useEffect(() => {
    const sixteenths = positionToSixteenths(position);

    if ((!isPlay && !isRecord) || isForward || isBackward || isScrollToPixel) {
      movePlayHead(0, (sixteenths - 1) * PIXELS_PER_SIXTEENTH);
      hasScrolledToLoopStartRef.current = false;
      return;
    }

    let duration = Tone.TransportTime("16n").toSeconds();
    if (toPosition(loopStart) === roundPosition(position) && isLoop) {
      duration = 0;
      if (!hasScrolledToLoopStartRef.current) {
        const loopStartSixteenths = positionToSixteenths(toPosition(loopStart));
        const loopStartPixels = loopStartSixteenths * PIXELS_PER_SIXTEENTH;
        setIsScrollGrid(true);
        setPlayheadPosition(loopStartPixels);
        setIsLoopReset(true);
        hasScrolledToLoopStartRef.current = true;
      }
    } else {
      hasScrolledToLoopStartRef.current = false;
    }

    if (isPositionZero(position)) {
      duration = 0;
    }

    movePlayHead(duration, sixteenths * PIXELS_PER_SIXTEENTH);
  }, [
    isPlay,
    isRecord,
    position,
    isForward,
    isBackward,
    loopStart,
    isLoop,
    isScrollToPixel,
    movePlayHead,
    setIsScrollGrid,
    setPlayheadPosition,
    setIsLoopReset,
  ]);

  useEffect(() => {
    if (
      (isPlay || isRecord) &&
      !isScrollToPixel &&
      !isUserScrollingRef.current
    ) {
      const sixteenths = positionToSixteenths(position);
      const pixels = sixteenths * PIXELS_PER_SIXTEENTH;
      const visibleLeft = scrollLeft;
      const visibleRight =
        scrollLeft + (gridWidth - trackListWidth - trackToolsWidth);
      const buffer = 100;

      if (
        pixels >= visibleLeft &&
        pixels <= visibleRight &&
        pixels >= visibleRight - buffer
      ) {
        setIsScrollGrid(true);
        setPlayheadPosition(pixels);
        setIsLoopReset(false);
      }
    }
  }, [
    gridWidth,
    isPlay,
    isRecord,
    scrollLeft,
    trackListWidth,
    position,
    trackToolsWidth,
    isScrollToPixel,
    setIsScrollGrid,
    setPlayheadPosition,
    setIsLoopReset,
  ]);

  useEffect(() => {
    if (isReset) {
      const sixteenths = positionToSixteenths(toPosition(loopStart));
      const pixels = isLoop ? sixteenths * PIXELS_PER_SIXTEENTH : 0;
      movePlayHead(0, pixels);
      setIsReset(false);
    }
  }, [isReset, loopStart, isLoop, movePlayHead, setIsReset]);

  return (
    <div
      ref={playHeadRef}
      role="presentation"
      className="border-solid border-white border absolute top-0 left-0"
      style={{
        width: "1px",
        minHeight: "100%",
        transform: "translate(0px)",
      }}
    />
  );
};

export default GridPlayHead;
