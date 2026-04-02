import { useCallback, useEffect, useState } from "react";
import * as Tone from "tone";

import { PIXELS_PER_SIXTEENTH } from "@/consts";

import { type Track } from "@/types";
import { positionToSixteenths, toPosition } from "@/utils";
import useTransportStore from "./useTransportStore";
import usePlayers from "./usePlayers";
import useTempo from "./useTempo";
import useScreenStore from "@/features/screen/hooks/useScreenStore";
import usePositionStore from "@/features/position/hooks/usePositionStore";

interface TransportControlsProps {
  tracks: Track[];
  isLoop: boolean;
  loopStart: number;
  loopEnd: number;
  stopPosition: string | null;
  isPlay: boolean;
  isForward: boolean;
  isBackward: boolean;
}

export const useTransportControls = ({
  tracks,
  isLoop,
  loopStart,
  loopEnd,
  stopPosition,
  isPlay,
  isForward,
  isBackward,
}: TransportControlsProps) => {
  const [started, setStarted] = useState(false);
  const {
    isScrollToPixel,
    scrollLeft,
    gridWidth,
    trackListWidth,
    trackToolsWidth,
    setScrollToPixel,
    setIsScrollToPixel,
  } = useScreenStore();
  const { setPosition, setStopPosition } = usePositionStore();
  const { setIsPlay } = useTransportStore();
  const { players, stopAndClearAll } = usePlayers(tracks);
  useTempo(players, tracks);

  const handleStop = useCallback(() => {
    if (!players) return;

    const pos = isLoop ? toPosition(loopStart) : Tone.getTransport().position;
    Tone.getTransport().stop();
    setIsPlay(false);
    setPosition(pos);
    setStopPosition(pos);
    Tone.getTransport().position = pos;
    stopAndClearAll();
  }, [
    players,
    isLoop,
    loopStart,
    setIsPlay,
    setPosition,
    setStopPosition,
    stopAndClearAll,
  ]);

  const handlePlay = useCallback(async () => {
    if (!started) {
      await Tone.start();
      setStarted(true);
    }

    // Calculate playhead position in pixels
    const currentPosition =
      stopPosition ?? (isLoop ? toPosition(loopStart) : "0:0:0");
    const sixteenths = positionToSixteenths(currentPosition);
    const playheadPixels = sixteenths * PIXELS_PER_SIXTEENTH;

    // Define visible window
    const visibleLeft = scrollLeft;
    const visibleRight =
      scrollLeft + (gridWidth - trackListWidth - trackToolsWidth);

    // Check if playhead is off-screen
    if (playheadPixels < visibleLeft || playheadPixels > visibleRight) {
      // Scroll to center the playhead in the viewport
      const viewportWidth = gridWidth - trackListWidth - trackToolsWidth;
      const newScrollLeft = Math.max(0, playheadPixels - viewportWidth / 2);

      setScrollToPixel(newScrollLeft);
      setIsScrollToPixel(true);

      // Wait for the scroll to take effect (next frame)
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }

    // Set transport position
    if (isLoop) {
      if (
        (stopPosition ?? 0) < toPosition(loopStart) ||
        (stopPosition ?? 0) > toPosition(loopEnd)
      ) {
        const pos = toPosition(loopStart);
        Tone.getTransport().position = pos;
        setPosition(pos);
        setStopPosition(pos);
      }
    } else {
      Tone.getTransport().position = stopPosition ?? "0:0:0";
    }

    Tone.getTransport().start();

    setIsPlay(true);
  }, [
    started,
    stopPosition,
    isLoop,
    loopStart,
    scrollLeft,
    gridWidth,
    trackListWidth,
    trackToolsWidth,
    setIsPlay,
    setScrollToPixel,
    setIsScrollToPixel,
    loopEnd,
    setPosition,
    setStopPosition,
  ]);

  useEffect(() => {
    if (isPlay && (isForward || isBackward)) {
      handleStop();
    }
  }, [handleStop, isBackward, isForward, isPlay, isScrollToPixel]);

  return { handlePlay, handleStop };
};
