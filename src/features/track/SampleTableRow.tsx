import { FaPlay, FaStop, FaSpinner } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import type { Sample } from "./hooks/useSampleLibrary";

type Props = {
  sample: Sample;
  isPlaying: boolean;
  isLoading: boolean;
  onTogglePreview: (sample: Sample) => void;
  onLoadTrack: (sample: Sample) => void;
};

export const SampleTableRow = ({
  sample,
  isPlaying,
  isLoading,
  onTogglePreview,
  onLoadTrack,
}: Props) => (
  <tr className="hover:bg-neutral-900 group h-9 transition-colors">
    <td className="px-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onTogglePreview(sample)}
        className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-neutral-800"
      >
        {isPlaying ? (
          <FaStop className="h-3.5 w-3.5" />
        ) : (
          <FaPlay className="h-3.5 w-3.5" />
        )}
      </Button>
    </td>

    <td className="px-3 py-2 truncate font-mono text-xs text-gray-100">
      {sample.filename}
    </td>

    <td className="px-3 py-2 text-center text-gray-400 tabular-nums text-xs">
      {sample.bpm || "—"}
    </td>

    <td className="px-3 py-2 text-center text-gray-400 font-medium text-xs">
      {sample.key || "—"}
    </td>

    <td className="px-3 py-2 text-right">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onLoadTrack(sample)}
        disabled={isLoading}
        className="h-7 px-4 text-xs opacity-60 group-hover:opacity-100 transition-opacity border-neutral-700 hover:border-neutral-500"
      >
        {isLoading ? <FaSpinner className="animate-spin h-3 w-3" /> : "Add"}
      </Button>
    </td>
  </tr>
);
