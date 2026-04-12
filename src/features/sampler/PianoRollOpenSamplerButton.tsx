import { useNavigate } from "@tanstack/react-router";

type Props = {
  trackId: string;
  stackId: string;
};

export default function PianoRollOpenSamplerButton({
  trackId,
  stackId,
}: Props) {
  const navigate = useNavigate();

  const handleOpenSampler = () => {
    navigate({
      to: "/stacks/$stackId/sampler/$trackId",
      params: { stackId, trackId },
      replace: true,
    });
  };

  return (
    <button
      onClick={handleOpenSampler}
      className="px-4 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded text-sm text-white transition-colors"
    >
      Sampler
    </button>
  );
}
