import { useCallback, useEffect, useState } from "react";
import * as Tone from "tone";
import { useNavigate } from "@tanstack/react-router";

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

import { formatPosition, isPositionZero, toPosition } from "@/utils";
import usePositionStore from "../position/hooks/usePositionStore";

const calculateScrollAndPosition = (bar: string) => {
  const numValue = Number(bar);
  const validatedBar = isNaN(numValue) || numValue < 0 ? 0 : numValue;
  const newPos = toPosition(validatedBar);
  return { newPos, validatedBar };
};

export const TransportPositionDialog = () => {
  const navigate = useNavigate();

  const { position, setPosition, setStopPosition } = usePositionStore();

  const pos = formatPosition(position);
  const [isOpen, setIsOpen] = useState(false);
  const [newBar, setNewBar] = useState(String(pos.bars + 1));

  useEffect(() => {
    const updatePosition = () => {
      const currentPosition = Tone.getTransport().position;
      if (isPositionZero(currentPosition)) {
        setPosition(currentPosition);
        setStopPosition("0:0:0");
      } else {
        setPosition(currentPosition);
      }
    };
    const intervalId = Tone.getTransport().scheduleRepeat(
      updatePosition,
      "1:0:0",
    );
    return () => {
      Tone.getTransport().clear(intervalId);
    };
  }, [setPosition, setStopPosition]);

  const handleBarChange = useCallback((value: string) => {
    setNewBar(value);
  }, []);

  const handleSubmit = useCallback(
    (e: React.SubmitEvent) => {
      e.preventDefault();

      let submittedBar = Number(newBar);
      if (isNaN(submittedBar) || submittedBar < 1) {
        submittedBar = 1;
        setNewBar("1");
      }

      const { newPos } = calculateScrollAndPosition(String(submittedBar - 1));

      Tone.getTransport().position = newPos;
      setPosition(newPos);
      setStopPosition(newPos);

      const pageSize = 8;
      const targetPage = Math.floor((submittedBar - 1) / pageSize);

      navigate({
        to: ".",
        search: { page: targetPage },
        replace: true,
      });

      setNewBar(String(submittedBar));
      setIsOpen(false);
    },
    [newBar, setPosition, setStopPosition, navigate],
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-9 px-3 text-sm font-medium">
          Pos: <span className="font-semibold ml-1">{pos.bars + 1}</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="focus:outline-none sm:max-w-[350px]"
        aria-describedby="position-dialog-description"
      >
        <DialogHeader>
          <DialogTitle>Move to Position</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Configure the position by setting the bar number.
        </DialogDescription>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bar" className="text-right">
                Bar
              </Label>
              <Input
                id="bar"
                name="bar"
                type="number"
                min="1"
                max="200"
                value={newBar}
                required
                className="col-span-1"
                onChange={(e) => handleBarChange(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">OK</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransportPositionDialog;
