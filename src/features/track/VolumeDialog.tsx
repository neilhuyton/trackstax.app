import { useState } from "react";

import { FaVolumeHigh } from "react-icons/fa6";

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
import { Label } from "@/components/ui/label";

import { type Track } from "@/types";

export const TrackVolumeDialog = ({ track }: { track: Track }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Adjust volume for track ${track.id}`}
        >
          <FaVolumeHigh title="Volume" className="hover:cursor-pointer" />
        </Button>
      </DialogTrigger>

      <DialogContent className="focus:outline-none sm:max-w-[425px] [&>button:last-child]:hidden">
        <DialogHeader>
          <DialogTitle>Track settings</DialogTitle>
          <DialogDescription>
            Adjust the volume for track {track.id}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <h3 data-testid="volume-label">Volume</h3>
          <div className="grid items-center gap-4">
            <Label htmlFor="volumePercent-range">{} %</Label>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleClose} disabled>
            {"OK"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TrackVolumeDialog;
