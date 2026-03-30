import { useEffect, useState } from "react";
import { FaArrowsRotate } from "react-icons/fa6";
import { getTransport } from "tone";

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
import { Switch } from "@/components/ui/switch";

import useStackIdStore from "../stacks/useStackIdStore";
import { useTransportRead } from "./useTransportRead";
import { useTRPC } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const TransportLoopDialog = () => {
  const stackId = useStackIdStore((state) => state.stackId);
  const { transport, isError, isLoading } = useTransportRead(stackId);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [newIsLoop, setNewIsLoop] = useState(false);
  const [newStart, setNewStart] = useState(1);
  const [newEnd, setNewEnd] = useState(4);

  const updateMutation = useMutation(
    trpc.transport.update.mutationOptions({
      onSuccess: (updatedTransport) => {
        queryClient.setQueryData(
          trpc.transport.getByStackId.queryKey({ stackId: stackId! }),
          updatedTransport,
        );
        setIsOpen(false);
      },
      onError: (error) => {
        console.error("Failed to update loop settings:", error);
      },
    }),
  );

  useEffect(() => {
    if (transport) {
      setNewIsLoop(transport.isLoop);
      setNewStart(transport.loopStart + 1);
      setNewEnd(transport.loopEnd);

      const toneTransport = getTransport();
      toneTransport.setLoopPoints(
        `${transport.loopStart}m`,
        `${transport.loopEnd}m`,
      );
      toneTransport.loop = transport.isLoop;
    }
  }, [transport]);

  if (isError || isLoading || !transport || !stackId) {
    return null;
  }

  const handleToggleLoop = (checked: boolean) => {
    setNewIsLoop(checked);
  };

  const handleStartChange = (value: string) => {
    setNewStart(Number(value) || 1);
  };

  const handleEndChange = (value: string) => {
    setNewEnd(Number(value) || newStart + 1);
  };

  const handleSave = () => {
    const start = Math.max(0, newStart - 1);
    const end = Math.max(start + 1, newEnd);

    const toneTransport = getTransport();
    toneTransport.setLoopPoints(`${start}m`, `${end}m`);
    toneTransport.loop = newIsLoop;

    updateMutation.mutate({
      stackId,
      isLoop: newIsLoop,
      loopStart: start,
      loopEnd: end,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={transport.isLoop ? "default" : "outline"}
          title={`Loop is ${transport.isLoop ? "on" : "off"}`}
        >
          <FaArrowsRotate data-testid="loop-icon" />
        </Button>
      </DialogTrigger>

      <DialogContent className="focus:outline-none sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Loop Settings</DialogTitle>
          <DialogDescription>
            Configure loop settings by toggling the loop state and setting start
            and end points.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="loopToggle" className="text-right">
              Toggle
            </Label>
            <Switch
              id="loopToggle"
              checked={newIsLoop}
              onCheckedChange={handleToggleLoop}
            />
            <span className="col-span-2">{newIsLoop ? "On" : "Off"}</span>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="loopStart" className="text-right">
              Start
            </Label>
            <Input
              id="loopStart"
              type="number"
              min="1"
              max="200"
              value={newStart}
              onChange={(e) => handleStartChange(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="loopEnd" className="text-right">
              End
            </Label>
            <Input
              id="loopEnd"
              type="number"
              min="1"
              max="200"
              value={newEnd}
              onChange={(e) => handleEndChange(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransportLoopDialog;
