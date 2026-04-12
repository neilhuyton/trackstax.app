import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import useStackIdStore from "../stacks/hooks/useStackIdStore";

export const AddTrackButton = () => {
  const navigate = useNavigate();
  const stackId = useStackIdStore((state) => state.stackId);

  const handleClick = () => {
    navigate({
      to: "/stacks/$stackId/add-track",
      params: { stackId },
      search: {
        page: 0,
        returnTo: undefined,
        sampleUrl: undefined,
        filename: undefined,
        lowNote: undefined,
        highNote: undefined,
      },
    });
  };

  return (
    <Button
      onClick={handleClick}
      className="w-full h-full pl-4 rounded-md border-2 border-neutral-700 bg-neutral-900 hover:bg-neutral-800"
    >
      + Add Track
    </Button>
  );
};
