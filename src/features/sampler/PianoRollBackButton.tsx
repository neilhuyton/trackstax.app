import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

type Props = {
  stackId: string;
};

export default function PianoRollBackButton({ stackId }: Props) {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate({
      to: "/stacks/$stackId",
      params: { stackId },
      search: { page: 0 },
      replace: true,
    });
  };

  return (
    <button
      onClick={handleBack}
      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-1 text-sm font-medium"
    >
      <ChevronLeft className="h-5 w-5" />
      <span>Back to Grid</span>
    </button>
  );
}
