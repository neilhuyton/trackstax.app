import { useCallback, useEffect, useState } from "react";
import * as Tone from "tone";

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

import { PIXELS_PER_SIXTEENTH } from "@/consts";

import { formatPosition, isPositionZero, toPosition } from "@/utils";
import usePositionStore from "../stores/position";
import useScreenStore from "../stores/screen";

const calculateScrollAndPosition = (
  bar: string,
  gridWidth: number,
  trackListWidth: number,
  trackToolsWidth: number
) => {
  const numValue = Number(bar);
  const validatedBar = isNaN(numValue) || numValue < 0 ? 0 : numValue;
  const newPos = toPosition(validatedBar);
  const playheadPixel = validatedBar * PIXELS_PER_SIXTEENTH * 16;
  const halfGridWidth = (gridWidth - (trackListWidth + trackToolsWidth)) / 2;
  const scrollToPixel = Math.max(0, playheadPixel - halfGridWidth);
  return { newPos, scrollToPixel, validatedBar };
};

export const TransportPositionDialog = () => {
  const { position, setPosition, setStopPosition } = usePositionStore();
  const {
    isScrollToPixel,
    gridWidth,
    trackListWidth,
    trackToolsWidth,
    scrollToPixel,
    setScrollToPixel,
    setIsScrollToPixel,
  } = useScreenStore();

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
      "0:0:1"
    );
    return () => {
      Tone.getTransport().clear(intervalId);
    };
  }, [setPosition, setStopPosition]);

  useEffect(() => {
    if (isScrollToPixel) {
      setScrollToPixel(scrollToPixel);
      setIsScrollToPixel(false);
    }
  }, [isScrollToPixel, scrollToPixel, setIsScrollToPixel, setScrollToPixel]);

  const handleBarChange = useCallback((value: string) => {
    setNewBar(value);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      let submittedBar = Number(newBar);
      if (isNaN(submittedBar) || submittedBar < 1) {
        submittedBar = 1;
        setNewBar("1");
      }
      const { newPos, scrollToPixel } = calculateScrollAndPosition(
        String(submittedBar - 1),
        gridWidth,
        trackListWidth,
        trackToolsWidth
      );

      Tone.getTransport().position = newPos;
      setPosition(newPos);
      setStopPosition(newPos);
      setScrollToPixel(scrollToPixel);
      setIsScrollToPixel(true);
      setNewBar(String(submittedBar));
      setIsOpen(false);
    },
    [
      newBar,
      gridWidth,
      trackListWidth,
      trackToolsWidth,
      setPosition,
      setStopPosition,
      setScrollToPixel,
      setIsScrollToPixel,
    ]
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          data-testid="position-button"
          className="text-white font-semibold text-xl leading-7 flex cursor-pointer"
          variant="outline"
        >
          <h3 className="text-white font-semibold text-xl leading-7 flex">
            <span className="pr-3">POSITION:</span>
            <span className="w-6 text-center text-right" data-testid="bars">
              {pos.bars + 1}
            </span>
            <span className="w-6 text-center text-right">:</span>
            <span className="w-6 text-center text-right" data-testid="beats">
              {pos.beats}
            </span>
            <span className="w-6 text-center text-right">:</span>
            <span
              className="w-6 text-center text-right"
              data-testid="sixteenths"
            >
              {pos.sixteenths}
            </span>
          </h3>
        </Button>
      </DialogTrigger>
      <DialogContent
        data-testid="dialog-content"
        className="focus:outline-none sm:max-w-[350px]"
        aria-describedby="position-dialog-description"
      >
        <DialogHeader>
          <DialogTitle data-testid="dialog-title">Move to Position</DialogTitle>
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
                data-testid="bar-input"
                onChange={(e) => handleBarChange(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" data-testid="submit-button">
              OK
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransportPositionDialog;