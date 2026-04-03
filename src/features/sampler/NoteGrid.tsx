import type { SamplerEvent, NoteName } from "@/types";
import { forwardRef } from "react";
import { durationToSteps } from "./utils/durationToSteps";

type Props = {
  pattern: SamplerEvent[];
  notes: readonly NoteName[];
  totalSteps: number;
  onAddNote: (time: string, note: string, duration?: string) => void;
  onRemoveNote: (time: string, note: string) => void;
};

const NoteGrid = forwardRef<HTMLDivElement, Props>(
  ({ pattern, notes, totalSteps, onAddNote, onRemoveNote }, ref) => {
    const isNoteActiveAtStep = (step: number, note: NoteName): boolean => {
      return pattern.some((event) => {
        if (event.note !== note) return false;

        const steps = durationToSteps(event.duration || "16n");
        const [eBar, eBeat, eSixteenth] = event.time.split(":").map(Number);
        const startStep = eBar * 16 + eBeat * 4 + eSixteenth;
        const endStep = startStep + steps;

        return step >= startStep && step < endStep;
      });
    };

    const isNoteStart = (step: number, note: NoteName): boolean => {
      const timeStr = stepToTime(step);
      return pattern.some((p) => p.time === timeStr && p.note === note);
    };

    const isNoteEnd = (step: number, note: NoteName): boolean => {
      return pattern.some((event) => {
        if (event.note !== note) return false;
        const steps = durationToSteps(event.duration || "16n");
        const [eBar, eBeat, eSixteenth] = event.time.split(":").map(Number);
        const startStep = eBar * 16 + eBeat * 4 + eSixteenth;
        const endStep = Math.floor(startStep + steps - 0.01);
        return step === endStep;
      });
    };

    const stepToTime = (step: number): string => {
      const bar = Math.floor(step / 16);
      const pos = step % 16;
      const beat = Math.floor(pos / 4);
      const sixteenth = pos % 4;
      return `${bar}:${beat}:${sixteenth}`;
    };

    const handleClick = (e: React.MouseEvent) => {
      const btn = (e.target as HTMLElement).closest("button");
      if (!btn) return;

      const step = Number(btn.dataset.step);
      const noteIndex = Number(btn.dataset.noteIndex);
      const note = notes[noteIndex];

      const isActive = isNoteActiveAtStep(step, note);

      if (isActive) {
        // Find original event to remove the whole note
        const originalEvent = pattern.find((event) => {
          if (event.note !== note) return false;
          const steps = durationToSteps(event.duration || "16n");
          const [eBar, eBeat, eSixteenth] = event.time.split(":").map(Number);
          const start = eBar * 16 + eBeat * 4 + eSixteenth;
          const end = start + steps;
          return step >= start && step < end;
        });

        if (originalEvent) {
          onRemoveNote(originalEvent.time, note);
        }
      } else {
        const time = stepToTime(step);
        onAddNote(time, note, "16n"); // default new notes to 16n
      }
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
              const isActive = isNoteActiveAtStep(step, note);
              const isStart = isNoteStart(step, note);
              const isEnd = isNoteEnd(step, note);

              return (
                <button
                  key={`${note}-${step}`}
                  data-step={step}
                  data-note-index={noteIndex}
                  className={`
                    w-[28px] h-[28px] border border-gray-800 transition-all relative overflow-hidden
                    ${
                      isActive
                        ? "bg-violet-500 border-violet-400"
                        : "bg-zinc-900 hover:bg-zinc-700"
                    }
                    ${isStart ? "border-l-2 border-violet-300" : ""}
                    ${isEnd ? "border-r-2 border-violet-300" : ""}
                    ${isActive && !isStart ? "border-l-0" : ""}
                    ${isActive && !isEnd ? "border-r-0" : ""}
                  `}
                >
                  {isStart && isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/60" />
                  )}
                </button>
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
