import { useState } from "react";

import { FaSpinner } from "react-icons/fa6";

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

import useStackIdStore from "../stacks/useStackIdStore";
import useTransportStore from "./useTransportStore";
import { useTransportRead } from "./useTransportRead";

import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";

export function TransportTempoDialog() {
  const stackId = useStackIdStore((state) => state.stackId);
  const { transport, isError, isLoading } = useTransportRead(stackId);
  const { setIsTempo } = useTransportStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updateTransportMutation = useMutation(
    trpc.transport.update.mutationOptions({
      onSuccess: () => {
        setIsOpen(false);
      },
      onError: (error) => {
        console.error("Failed to update tempo:", error);
      },
    }),
  );

  const handleSubmit = async (newTempo: number) => {
    if (!transport) return;
    setIsSaving(true);
    try {
      setIsTempo(true);

      await updateTransportMutation.mutateAsync({
        stackId: stackId,
        tempo: newTempo,
      });
    } catch (error) {
      console.error("Failed to update tempo:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isError || isLoading || !transport) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="text-white font-semibold text-xl flex cursor-pointer"
        >
          <span>TEMPO:</span>
          <span className="w-14">{transport.tempo}</span>
          <span>BPM</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="focus:outline-none sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Stack Tempo</DialogTitle>
          <DialogDescription>
            Adjust the tempo in beats per minute (BPM) for your stack.
          </DialogDescription>
        </DialogHeader>

        <form
          data-testid="tempo-form"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const tempoValue = formData.get("tempo");
            const newTempo = tempoValue ? Number(tempoValue) : NaN;
            handleSubmit(newTempo);
          }}
          className="flex flex-col gap-4"
        >
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tempo" className="text-right">
                BPM
              </Label>
              <Input
                id="tempo"
                name="tempo"
                type="number"
                min="1"
                max="200"
                step="0.1"
                defaultValue={transport.tempo}
                required
                className="col-span-1"
                disabled={isSaving}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <FaSpinner className="animate-spin mr-2" /> : null}
              OK
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default TransportTempoDialog;
