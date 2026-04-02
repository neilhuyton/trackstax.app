import { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";

import { toPosition } from "@/utils";
import { useTransportRead } from "./useTransportRead";
import useTransportStore from "./useTransportStore";
import useStackIdStore from "@/features/stacks/hooks/useStackIdStore";
import usePositionStore from "@/features/position/hooks/usePositionStore";

const useRecord = (isRecording: boolean) => {
  const stackId = useStackIdStore((state) => state.stackId);
  const { transport, isLoading, isError } = useTransportRead(stackId);

  const { tempo = 120 } = transport || {};
  const { recordEnd, recordStart, setIsRecord } = useTransportStore();
  const [recording, setRecording] = useState<Blob | null>(null);
  const recorderRef = useRef<Tone.Recorder | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { setPosition, setStopPosition } = usePositionStore();

  const stopRecording = useCallback(async () => {
    if (recorderRef.current) {
      const blob = await recorderRef.current.stop();
      setRecording(blob);
      setIsRecord(false);
      Tone.getTransport().stop();
      Tone.getDestination().disconnect(recorderRef.current);
      recorderRef.current = null;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [setIsRecord]);

  useEffect(() => {
    if (!isRecording || !stackId || isLoading || isError) {
      return;
    }

    const startRecording = async () => {
      const position = toPosition(recordStart);
      setPosition(position);
      setStopPosition(position);
      Tone.getTransport().position = position;

      const recorder = new Tone.Recorder();
      recorderRef.current = recorder;
      Tone.getDestination().connect(recorder);

      Tone.getTransport().start();
      await recorder.start();

      const numBars = recordEnd - recordStart;
      const barInMs = (60000 / tempo) * numBars;
      const stackInMs = barInMs * 4;

      timeoutRef.current = setTimeout(async () => {
        await stopRecording();
      }, stackInMs);
    };

    startRecording();

    return () => {
      if (recorderRef.current) {
        stopRecording();
      }
    };
  }, [
    isRecording,
    stackId,
    tempo,
    recordEnd,
    recordStart,
    stopRecording,
    isLoading,
    isError,
    setPosition,
    setStopPosition,
  ]);

  return { recording, stopRecording };
};

export default useRecord;
