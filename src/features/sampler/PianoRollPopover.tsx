import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { NoteName } from "@/types";

type Props = {
  popoverData: {
    rowIndex: number;
    step: number;
    clientX: number;
    clientY: number;
  } | null;
  notes: readonly NoteName[];
  onDelete: (rowIndex: number, step: number) => void;
  onClose: () => void;
};

export default function PianoRollPopover({
  popoverData,
  notes,
  onDelete,
  onClose,
}: Props) {
  if (!popoverData) return null;

  const noteName = notes[popoverData.rowIndex] || "";
  const totalSixteenths = popoverData.step;
  const bar = Math.floor(totalSixteenths / 16);
  const remaining = totalSixteenths % 16;
  const beat = Math.floor(remaining / 4);
  const sixteenth = remaining % 4;
  const timeNotation = `${bar}:${beat}:${sixteenth}`;

  return (
    <Popover open={true} onOpenChange={(open) => !open && onClose()}>
      <PopoverTrigger asChild>
        <div
          className="absolute pointer-events-none"
          style={{
            left: popoverData.clientX,
            top: popoverData.clientY,
            transform: "translate(-50%, -50%)",
          }}
        />
      </PopoverTrigger>

      <PopoverContent
        className="w-80"
        side="bottom"
        align="start"
        sideOffset={8}
      >
        <div className="space-y-4">
          <h4 className="font-medium">Note Options</h4>
          <div className="space-y-1 text-sm">
            <p>
              Note: <span className="font-mono">{noteName}</span>
            </p>
            <p>
              Time: <span className="font-mono">{timeNotation}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onDelete(popoverData.rowIndex, popoverData.step);
                onClose();
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
            >
              Delete Note
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
