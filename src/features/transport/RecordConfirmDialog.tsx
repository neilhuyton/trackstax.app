import { useCallback, useEffect, useState } from "react";
import { FaCircle, FaStop } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { getLastBar } from "@/utils";
import useStackIdStore from "../stacks/hooks/useStackIdStore";
import { useTransportRead } from "./useTransportRead";
import useTracksStore from "../track/hooks/useTracksStore";
import useTransportStore from "./useTransportStore";
import useRecord from "./useRecord";

export const TransportRecordConfirmDialog = () => {
  const stackId = useStackIdStore((state) => state.stackId);
  const { transport, isError: transportError } = useTransportRead(stackId);
  const { tracks, isError: tracksError } = useTracksStore();
  const { isRecord, setIsRecord, setRecordStart, setRecordEnd } =
    useTransportStore();
  const { stopRecording } = useRecord(isRecord);

  const { isLoop, loopStart = 0, loopEnd = 4 } = transport || {};

  const [isOpen, setIsOpen] = useState(false);
  const [start, setStart] = useState(() => (isLoop ? loopStart + 1 : 1));
  const [end, setEnd] = useState(() => (isLoop ? loopEnd : getLastBar(tracks)));
  const [hasUserModified, setHasUserModified] = useState(false);

  useEffect(() => {
    if (!hasUserModified) {
      setStart(isLoop ? loopStart + 1 : 1);
      setEnd(isLoop ? loopEnd : getLastBar(tracks));
    }
  }, [isLoop, loopStart, loopEnd, tracks, hasUserModified]);

  const handleStartChange = (value: number) => {
    setStart(Math.max(1, value));
    setHasUserModified(true);
  };

  const handleEndChange = useCallback(
    (value: number) => {
      setEnd(Math.max(start + 1, value));
      setHasUserModified(true);
    },
    [start],
  );

  const handleRecordToggle = useCallback(() => {
    if (isRecord) {
      stopRecording();
      setIsRecord(false);
      setRecordStart(0);
      setRecordEnd(0);
      setIsOpen(false);
    } else {
      const newStart = Math.max(0, start - 1);
      const newEnd = Math.max(newStart + 1, end);
      setIsRecord(true);
      setRecordStart(newStart);
      setRecordEnd(newEnd);
      setIsOpen(false);
    }
    setHasUserModified(false);
  }, [
    isRecord,
    stopRecording,
    setIsRecord,
    setRecordStart,
    setRecordEnd,
    start,
    end,
  ]);

  if (transportError || tracksError) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          title={isRecord ? "Stop Recording" : "Record"}
          onClick={isRecord ? handleRecordToggle : undefined}
          className={isRecord ? "bg-red-500 animate-pulse" : ""}
        >
          {isRecord ? <FaStop /> : <FaCircle />}
        </Button>
      </DialogTrigger>

      <DialogContent className="focus:outline-none">
        <DialogHeader>
          <DialogTitle>Recording</DialogTitle>
          <DialogDescription>
            Enter the bars for recording start and end.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="recordStart" className="text-right">
              Start
            </Label>
            <Input
              id="recordStart"
              type="number"
              min="1"
              max="200"
              value={start}
              onChange={(e) => handleStartChange(Number(e.target.value) || 0)}
              required
              className="col-span-1"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="recordEnd" className="text-right">
              End
            </Label>
            <Input
              id="recordEnd"
              type="number"
              min="1"
              max="200"
              value={end}
              onChange={(e) => handleEndChange(Number(e.target.value) || 0)}
              required
              className="col-span-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleRecordToggle}>
            {isRecord ? "Stop Recording" : "Start Recording"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransportRecordConfirmDialog;
