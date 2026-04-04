// src/features/sampler/NoteGrid.tsx
import type { SamplerEvent, NoteName } from "@/types";
import { forwardRef, useRef } from "react";

type Props = {
  pattern: SamplerEvent[];
  notes: readonly NoteName[];
  totalSteps: number;
  onAddNote: (time: string, note: string) => void;   // purely local
};

const NoteGrid = forwardRef<HTMLDivElement, Props>(
  ({ pattern, notes, totalSteps, onAddNote }, ref) => {

    const isDragging = useRef(false);
    const lastStepRef = useRef<number | null>(null);
    const lastNoteRef = useRef<NoteName | null>(null);

    const stepToTime = (step: number): string => {
      const bar = Math.floor(step / 16);
      const pos = step % 16;
      const beat = Math.floor(pos / 4);
      const sixteenth = pos % 4;
      return `${bar}:${beat}:${sixteenth}`;
    };

    const isFilled = (step: number, note: NoteName): boolean => {
      return pattern.some(event => 
        event.note === note && event.time === stepToTime(step)
      );
    };

    const getPosition = (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const cellWidth = rect.width / totalSteps;
      const cellHeight = rect.height / notes.length;

      return {
        step: Math.max(0, Math.min(totalSteps - 1, Math.floor(x / cellWidth))),
        note: notes[Math.max(0, Math.min(notes.length - 1, Math.floor(y / cellHeight)))],
      };
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      isDragging.current = true;

      const { step, note } = getPosition(e);
      lastStepRef.current = step;
      lastNoteRef.current = note;

      if (!isFilled(step, note)) {
        onAddNote(stepToTime(step), note);
      }
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging.current) return;

      const { step, note } = getPosition(e);

      if (step === lastStepRef.current && note === lastNoteRef.current) return;

      if (!isFilled(step, note)) {
        onAddNote(stepToTime(step), note);
      }

      lastStepRef.current = step;
      lastNoteRef.current = note;
    };

    const handlePointerUp = () => {
      isDragging.current = false;
      lastStepRef.current = null;
      lastNoteRef.current = null;
    };

    const preventContextMenu = (e: React.MouseEvent) => e.preventDefault();

    return (
      <div ref={ref} className="flex-1 overflow-auto">
        <div
          className="grid bg-neutral-800 select-none touch-none relative"
          style={{
            gridTemplateColumns: `repeat(${totalSteps}, 28px)`,
            gridTemplateRows: `repeat(${notes.length}, 28px)`,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onContextMenu={preventContextMenu}
        >
          {notes.flatMap((note, noteIndex) =>
            Array.from({ length: totalSteps }, (_, step) => {
              const isActive = isFilled(step, note);
              const isStart = pattern.some(p => p.time === stepToTime(step) && p.note === note);

              return (
                <div
                  key={`${note}-${step}`}
                  className={`
                    w-[28px] h-[28px] border border-gray-800 transition-all pointer-events-none
                    ${isActive ? "bg-violet-500 border-violet-400" : "bg-zinc-900"}
                    ${isStart ? "border-l-2 border-violet-300" : ""}
                    ${isActive && !isStart ? "border-l-0" : ""}
                  `}
                >
                  {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/60" />}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }
);

NoteGrid.displayName = "NoteGrid";

export default NoteGrid;