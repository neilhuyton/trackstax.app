import type { SamplerEvent, NoteName } from "@/types";
import { forwardRef } from "react";

type Props = {
  pattern: SamplerEvent[];
  notes: readonly NoteName[];
  totalSteps: number;
  onAddNote: (time: string, note: string, duration?: string) => void;
  onRemoveNote: (time: string, note: string) => void;
};

const NoteGrid = forwardRef<HTMLDivElement, Props>(
  ({ pattern, notes, totalSteps, onAddNote, onRemoveNote }, ref) => {
    const handleClick = (e: React.MouseEvent) => {
      const btn = (e.target as HTMLElement).closest("button");
      if (!btn) return;

      const step = Number(btn.dataset.step);
      const noteIndex = Number(btn.dataset.noteIndex);
      const note = notes[noteIndex];

      const bar = Math.floor(step / 16);
      const positionInBar = step % 16;
      const beat = Math.floor(positionInBar / 4);
      const sixteenth = positionInBar % 4;
      const time = `${bar}:${beat}:${sixteenth}`;

      const isActive = pattern.some((p) => p.time === time && p.note === note);

      if (isActive) onRemoveNote(time, note);
      else onAddNote(time, note, "16n");
    };

    return (
      <div ref={ref} className="flex-1 overflow-auto">
        <div
          className="grid bg-neutral-800 select-none"
          style={{
            gridTemplateColumns: `repeat(${totalSteps}, 28px)`,
            gridTemplateRows: `repeat(${notes.length}, 28px)`,
          }}
          onClick={handleClick}
        >
          {notes.flatMap((note, noteIndex) =>
            Array.from({ length: totalSteps }, (_, step) => {
              const bar = Math.floor(step / 16);
              const positionInBar = step % 16;
              const beat = Math.floor(positionInBar / 4);
              const sixteenth = positionInBar % 4;
              const time = `${bar}:${beat}:${sixteenth}`;

              const isActive = pattern.some(
                (p) => p.time === time && p.note === note,
              );

              return (
                <button
                  key={`${note}-${step}`}
                  data-step={step}
                  data-note-index={noteIndex}
                  className={`w-[28px] h-[28px] border border-gray-800 transition-colors
                    ${
                      isActive
                        ? "bg-violet-500 border-violet-400"
                        : "bg-zinc-900 hover:bg-zinc-700"
                    }`}
                />
              );
            }),
          )}
        </div>
      </div>
    );
  },
);

NoteGrid.displayName = "NoteGrid";

export default NoteGrid;
