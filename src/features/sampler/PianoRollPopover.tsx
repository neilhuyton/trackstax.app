import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import type { NoteName, Line } from "@/types";
import { Check, Trash2, X } from "lucide-react";

type Props = {
  popoverData: {
    rowIndex: number;
    step: number;
    clientX: number;
    clientY: number;
  } | null;
  notes: readonly NoteName[];
  lines: readonly Line[];
  onConfirm: (rowIndex: number, startStep: number, duration: string) => void;
  onDelete: (rowIndex: number, step: number) => void;
  onClose: () => void;
};

export default function PianoRollPopover({
  popoverData,
  notes,
  lines,
  onConfirm,
  onDelete,
  onClose,
}: Props) {
  const [durationBars, setDurationBars] = useState(0);
  const [durationBeats, setDurationBeats] = useState(0);
  const [durationSixteenths, setDurationSixteenths] = useState(0);

  useEffect(() => {
    if (!popoverData) return;

    const existingLine = lines.find(
      (l) =>
        l.rowIndex === popoverData.rowIndex &&
        popoverData.step >= l.startStep &&
        popoverData.step <= l.endStep,
    );

    if (existingLine) {
      const durationInSteps = existingLine.endStep - existingLine.startStep + 1;
      const bars = Math.floor(durationInSteps / 16);
      const remaining = durationInSteps % 16;
      const beats = Math.floor(remaining / 4);
      const sixteenths = remaining % 4;

      setDurationBars(bars);
      setDurationBeats(beats);
      setDurationSixteenths(sixteenths);
    } else {
      setDurationBars(0);
      setDurationBeats(0);
      setDurationSixteenths(0);
    }
  }, [popoverData, lines]);

  if (!popoverData) return null;

  const noteName = notes[popoverData.rowIndex] || "";
  const totalSixteenths = popoverData.step;
  const bar = Math.floor(totalSixteenths / 16);
  const remaining = totalSixteenths % 16;
  const beat = Math.floor(remaining / 4);
  const sixteenth = remaining % 4;
  const timeNotation = `${bar}:${beat}:${sixteenth}`;

  const isExistingNote = lines.some(
    (l) =>
      l.rowIndex === popoverData.rowIndex &&
      popoverData.step >= l.startStep &&
      popoverData.step <= l.endStep,
  );

  const handleApply = () => {
    const durationStr = `${durationBars}:${durationBeats}:${durationSixteenths}`;
    onConfirm(popoverData.rowIndex, popoverData.step, durationStr);
    onClose();
  };

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
        className="w-60 p-3"
        side="bottom"
        align="start"
        sideOffset={6}
      >
        <div className="space-y-3">
          <div className="text-xs">
            <span className="font-mono text-neutral-200">{noteName}</span>
            <span className="text-neutral-500 mx-1">•</span>
            <span className="font-mono text-neutral-500">{timeNotation}</span>
          </div>

          <div>
            <div className="text-[10px] text-neutral-500 mb-1">DURATION</div>
            <div className="grid grid-cols-3 gap-1.5">
              <Select
                value={durationBars.toString()}
                onValueChange={(v) => setDurationBars(Number(v))}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 9 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={durationBeats.toString()}
                onValueChange={(v) => setDurationBeats(Number(v))}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3].map((i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={durationSixteenths.toString()}
                onValueChange={(v) => setDurationSixteenths(Number(v))}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3].map((i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-1 pt-1">
            <button
              onClick={handleApply}
              className="flex-1 h-7 flex items-center justify-center gap-1 bg-violet-600 hover:bg-violet-700 rounded text-xs font-medium"
            >
              <Check className="w-3 h-3" />
              Apply
            </button>

            {isExistingNote && (
              <button
                onClick={() => {
                  onDelete(popoverData.rowIndex, popoverData.step);
                  onClose();
                }}
                className="h-7 w-7 flex items-center justify-center bg-red-600 hover:bg-red-700 rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}

            <button
              onClick={onClose}
              className="h-7 w-7 flex items-center justify-center bg-zinc-700 hover:bg-zinc-600 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
