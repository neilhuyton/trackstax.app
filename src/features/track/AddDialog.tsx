import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { TrackLibraryDialog } from "./LibraryDialog";
import useStackIdStore from "../stores/useStackIdStore";
import { useStack } from "../stacks/useStackRead";
import useTracksStore from "../stores/tracks";
import { useAuthStore } from "@/store/authStore";

export const TrackAddDialog = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const stackId = useStackIdStore((state) => state.stackId);
  const { data: stack, isError: stackError } = useStack(stackId);
  const { tracks, isError: tracksError } = useTracksStore();
  const userId = useAuthStore((s) => s.user?.id);

  const isError = stackError || tracksError || !userId;

  if (isError) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="bg-neutral-900 hover:bg-neutral-800 w-full pl-4 rounded-md cursor-pointer h-[42px] mt-[6px] border-2 border-neutral-700"
          aria-label="+ Add Track"
          data-slot="dialog-trigger"
          data-testid="open-dialog-button"
        >
          <div className="text-left w-full text-white flex items-center justify-between">
            + Add Track
          </div>
        </Button>
      </DialogTrigger>

      <DialogContent
        className="focus:outline-none"
        data-testid="track-add-dialog"
      >
        <DialogHeader>
          <DialogTitle>Add Track</DialogTitle>
          <DialogDescription>
            Add a new track by selecting from your library.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Choose from Library</h3>
            {stack && (
              <TrackLibraryDialog
                userId={userId ?? null}
                tracks={tracks}
                stack={stack}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrackAddDialog;
