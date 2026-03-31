import { useCallback, useState, useRef } from "react";

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

import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/trpc";
import { type Track } from "@/types";
import useTracksStore from "./hooks/useTracksStore";

export const TrackVolumeDialog = ({ track }: { track: Track }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [tempVolumePercent, setTempVolumePercent] = useState<number>(100);

  const originalVolumeRef = useRef<number>(100);

  const { storeUpdateTrack } = useTracksStore();

  const updateTrackMutation = useMutation(
    trpc.track.update.mutationOptions({
      onError: (error) => {
        console.error("Failed to update track volume:", error);
      },
    }),
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        const initialVolume = track.volumePercent ?? 100;
        setTempVolumePercent(initialVolume);
        originalVolumeRef.current = initialVolume;
      }
      setIsOpen(open);
    },
    [track.volumePercent],
  );

  const handleVolumeChange = useCallback(
    (volumePercent: number) => {
      const validated = Math.max(0, Math.min(100, volumePercent));
      setTempVolumePercent(validated);

      storeUpdateTrack({
        ...track,
        volumePercent: validated,
      });
    },
    [track, storeUpdateTrack],
  );

  const handleSave = useCallback(async () => {
    const hasChanged = tempVolumePercent !== originalVolumeRef.current;

    if (hasChanged) {
      try {
        await updateTrackMutation.mutateAsync({
          id: track.id,
          volumePercent: tempVolumePercent,
        });
      } catch (error) {
        console.error("Failed to save volume:", error);
      }
    }

    setIsOpen(false);
  }, [tempVolumePercent, track.id, updateTrackMutation]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
            Adjust the volume for track {track.id}. Changes apply immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <h3 data-testid="volume-label">Volume</h3>
          <div className="grid items-center gap-4">
            <Label htmlFor="volumePercent-range">{tempVolumePercent} %</Label>
            <Slider
              id="volumePercent-range"
              value={[tempVolumePercent]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => handleVolumeChange(value[0])}
              aria-label={`Volume for track ${track.id}`}
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

export default TrackVolumeDialog;
