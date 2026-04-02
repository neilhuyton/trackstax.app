import { useCallback, useEffect, useState } from "react";
import * as Tone from "tone";

import { type Track } from "@/types";
import { toPosition } from "@/utils";
import useTransportStore from "./useTransportStore";
import usePlayers from "./usePlayers";
import useTempo from "./useTempo";
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
    setIsPlay,
    loopEnd,
    setPosition,
    setStopPosition,
  ]);

  useEffect(() => {
    if (isPlay && (isForward || isBackward)) {
      handleStop();
    }
  }, [handleStop, isBackward, isForward, isPlay]);

  return { handlePlay, handleStop };
};
