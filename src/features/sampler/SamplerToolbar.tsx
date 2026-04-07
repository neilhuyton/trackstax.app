import { ChevronLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

type Props = {
  stackId: string;
  trackId: string;
};

export default function SamplerToolbar({ stackId, trackId }: Props) {
  const navigate = useNavigate();

  const goToPianoRoll = () => {
    navigate({
      to: "/stacks/$stackId/piano-roll/$trackId",
      params: { stackId, trackId },
      replace: true,
    });
  };

  return (
    <div className="h-10 flex items-center px-4 border-neutral-800 bg-neutral-950">
      <button
        onClick={goToPianoRoll}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors h-9 px-1 text-sm font-medium"
      >
        <ChevronLeft className="h-5 w-5" />
        <span className="font-medium">Back to Piano Roll</span>
      </button>
    </div>
  );
}
