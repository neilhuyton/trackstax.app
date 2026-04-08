import { useCallback, useState, useRef, useEffect } from "react";

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
import { Slider } from "@/components/ui/slider";

import { useMasterVolume } from "./hooks/useMasterVolume";
import useTransportStore from "./hooks/useTransportStore";
import { useMasterVolumePersistence } from "./hooks/useMasterVolumePersistence";
import useStackIdStore from "../stacks/hooks/useStackIdStore";

export const MasterVolumeDialog = () => {
  const stackId = useStackIdStore((state) => state.stackId);
  const { setMasterVolumePercent } = useMasterVolume();
  const { saveMasterVolume } = useMasterVolumePersistence(stackId || "");
  const masterVolumePercent = useTransportStore(
    (state) => state.masterVolumePercent,
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [tempVolumePercent, setTempVolumePercent] = useState<number>(100);
  const originalVolumeRef = useRef<number>(100);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        const currentVolume = masterVolumePercent ?? 100;
        setTempVolumePercent(currentVolume);
        originalVolumeRef.current = currentVolume;
      }
      setIsOpen(open);
    },
    [masterVolumePercent],
  );

  const handleVolumeChange = useCallback(
    (volumePercent: number) => {
      const validated = Math.max(0, Math.min(100, volumePercent));
      setTempVolumePercent(validated);
      setMasterVolumePercent(validated);
    },
    [setMasterVolumePercent],
  );

  const handleSave = useCallback(() => {
    saveMasterVolume(tempVolumePercent);
    setIsOpen(false);
  }, [tempVolumePercent, saveMasterVolume]);

  useEffect(() => {
    if (isOpen) {
      setTempVolumePercent(masterVolumePercent ?? 100);
    }
  }, [masterVolumePercent, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Adjust master volume">
          <FaVolumeHigh
            title="Master Volume"
            className="hover:cursor-pointer"
          />
        </Button>
      </DialogTrigger>

      <DialogContent className="focus:outline-none sm:max-w-[425px] [&>button:last-child]:hidden">
        <DialogHeader>
          <DialogTitle>Master Volume</DialogTitle>
          <DialogDescription>
            Adjust the overall volume for the entire stack. Changes apply
            immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <h3 data-testid="master-volume-label">Master Volume</h3>
          <div className="grid items-center gap-4">
            <Label htmlFor="master-volumePercent-range">
              {tempVolumePercent} %
            </Label>
            <Slider
              id="master-volumePercent-range"
              value={[tempVolumePercent]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => handleVolumeChange(value[0])}
              aria-label="Master volume"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleSave}>
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MasterVolumeDialog;
