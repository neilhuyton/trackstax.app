import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import { TrackLibraryDialog } from "../library/LibraryDialog";
import useStackIdStore from "../stacks/hooks/useStackIdStore";
import { useStack } from "../stacks/hooks/useStackRead";
import useTracksStore from "./hooks/useTracksStore";
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
          className="focus:outline-none focus-visible:ring-2 focus-visible:border-neutral-700 focus:bg-neutral-900 bg-neutral-900 hover:bg-neutral-800 w-full h-full pl-4 rounded-md cursor-pointer border-2 border-neutral-700 flex items-center text-left transition-colors"
          aria-label="+ Add Track"
          data-slot="dialog-trigger"
          data-testid="open-dialog-button"
        >
          <div className="text-white flex-1">+ Add Track</div>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[920px] h-[100vh] p-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Add Track from Library</DialogTitle>
          <DialogDescription>Browse and choose your sample</DialogDescription>
        </VisuallyHidden>

        <div className="flex-1 overflow-hidden">
          {stack && (
            <TrackLibraryDialog
              userId={userId ?? null}
              tracks={tracks}
              stack={stack}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrackAddDialog;
