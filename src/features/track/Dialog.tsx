import { useEffect, useState } from "react";
import { FaCircleExclamation, FaSpinner } from "react-icons/fa6";

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

import { borderColors } from "@/consts";
import { type Track } from "@/types";
import useTracksStore from "./hooks/useTracksStore";

import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";
import ConfirmDialog from "./ConfirmDialog";

import { useNavigate } from "@tanstack/react-router";
import { toClientTrack } from "../utils/track-utils";
import { KeyboardMusic } from "lucide-react";

type TrackDialogProps = {
  track: Track;
  trackError: boolean;
};

export const TrackDialog = ({ track, trackError }: TrackDialogProps) => {
  const navigate = useNavigate();
  const { storeUpdateTrack, storeDeleteTrack } = useTracksStore();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] =
    useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [formValues, setFormValues] = useState({
    label: track?.label ?? "",
  });

  useEffect(() => {
    setFormValues({ label: track?.label ?? "" });
  }, [track]);

  const updateTrackMutation = useMutation(
    trpc.track.update.mutationOptions({
      onSuccess: (updatedTrack) => {
        storeUpdateTrack(toClientTrack(updatedTrack));
        setIsOpen(false);
      },
    }),
  );

  const deleteTrackMutation = useMutation(
    trpc.track.delete.mutationOptions({
      onSuccess: () => {
        if (track?.id) storeDeleteTrack(track.id);
        setIsDeleteConfirmOpen(false);
        setIsOpen(false);
      },
    }),
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async () => {
    if (!track?.id) return;
    await deleteTrackMutation.mutateAsync({ id: track.id });
  };

  const handleSubmit = async () => {
    if (!track?.id) return;
    setIsSaving(true);
    try {
      await updateTrackMutation.mutateAsync({
        id: track.id,
        label: formValues.label,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit();
  };

  const openPianoRoll = () => {
    if (track.type === "sampler" && track.stackId) {
      navigate({
        to: "/stacks/$stackId/piano-roll/$trackId",
        params: {
          stackId: track.stackId,
          trackId: track.id,
        },
        replace: true,
      });
      setIsOpen(false);
    }
  };

  const color = borderColors[track.color as keyof typeof borderColors];
  const isSampler = track.type === "sampler";

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild data-testid="dialog-trigger">
          <Button
            type="button"
            className={`focus:outline-none focus-visible:ring-2 focus-visible:${color} focus:bg-neutral-900 bg-neutral-900 hover:bg-neutral-800 w-full h-full pl-4 rounded-md cursor-pointer border-2 ${color} flex items-center text-left transition-colors relative`}
          >
            <div className="text-white flex-1 truncate pr-2">{track.label}</div>

            {trackError && (
              <FaCircleExclamation
                className="text-red-500 ml-2 flex-shrink-0"
                title="There is an error with this track"
              />
            )}

            {/* Piano Roll Icon */}
            {isSampler && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  openPianoRoll();
                }}
                className="ml-2 h-7 w-7 flex items-center justify-center text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800 rounded-md transition-colors cursor-pointer flex-shrink-0"
                title="Edit Piano Roll"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openPianoRoll();
                  }
                }}
              >
                <KeyboardMusic className="h-5 w-5" />
              </div>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="focus:outline-none sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Track</DialogTitle>
            <DialogDescription>
              Edit the track label or remove the track.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleFormSubmit}
            className="flex flex-col gap-4 mt-0 pt-0"
          >
            <div className="grid gap-4 py-4 pt-0">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="filename" className="text-right">
                  Filename
                </Label>
                <Input
                  id="filename"
                  defaultValue={track.audioTrack?.filename ?? ""}
                  disabled
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="label" className="text-right">
                  Label
                </Label>
                <Input
                  id="label"
                  name="label"
                  value={formValues.label}
                  onChange={handleInputChange}
                  required
                  className="col-span-3"
                />
              </div>

              {isSampler && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Piano Roll</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={openPianoRoll}
                    className="col-span-3"
                  >
                    <KeyboardMusic className="mr-2 h-5 w-5" />
                    Open Piano Roll Editor
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="delete"
                  className="text-right whitespace-nowrap"
                >
                  Remove track
                </Label>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                >
                  Remove
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="submit"
                disabled={isSaving || updateTrackMutation.isPending}
              >
                {isSaving || updateTrackMutation.isPending ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : null}
                OK
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title="Confirm Deletion"
        message={
          <>
            <p>Are you sure you want to remove this track?</p>
            <p className="text-sm text-gray-500">
              This action cannot be undone. The track "{track.label}" will be
              removed.
            </p>
          </>
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
      />
    </>
  );
};

export default TrackDialog;
