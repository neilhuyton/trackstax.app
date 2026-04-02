import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import useStackIdStore from "../stacks/hooks/useStackIdStore";
import { useStack } from "../stacks/hooks/useStackRead";
import useTracksStore from "./hooks/useTracksStore";
import { useAuthStore } from "@/store/authStore";

export const TrackAddDialog = () => {
  const navigate = useNavigate();
  const stackId = useStackIdStore((state) => state.stackId);
  const { isError: stackError } = useStack(stackId);
  const { isError: tracksError } = useTracksStore();
  const userId = useAuthStore((s) => s.user?.id);

  const isError = stackError || tracksError || !userId || !stackId;

  if (isError) return null;

  const handleClick = () => {
    navigate({
      to: "/stacks/$stackId/library",
      params: { stackId },
    });
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      className="focus:outline-none focus-visible:ring-2 focus-visible:border-neutral-700 focus:bg-neutral-900 bg-neutral-900 hover:bg-neutral-800 w-full h-full pl-4 rounded-md cursor-pointer border-2 border-neutral-700 flex items-center text-left transition-colors"
      aria-label="+ Add Track"
      data-slot="dialog-trigger"
      data-testid="open-dialog-button"
    >
      <div className="text-white flex-1">+ Add Track</div>
    </Button>
  );
};

export default TrackAddDialog;
