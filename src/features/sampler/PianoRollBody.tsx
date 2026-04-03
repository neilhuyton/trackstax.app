import type { SamplerEvent, NoteName } from "@/types";

type Props = {
  pattern: SamplerEvent[];
  notes: readonly NoteName[];
  barCount: number;
  onAddNote: (time: string, note: string, duration?: string) => void;
  onRemoveNote: (time: string, note: string) => void;
};

export default function PianoRollBody({
  pattern,
  notes,
  barCount,
  onAddNote,
  onRemoveNote,
}: Props) {
  const totalSteps = barCount * 16;

  const handleClick = (e: React.MouseEvent) => {
    const btn = (e.target as HTMLElement).closest("button");
    if (!btn) return;

    const step = Number(btn.dataset.step);
    const noteIndex = Number(btn.dataset.noteIndex);
    const note = notes[noteIndex];

    const bar = Math.floor(step / 16);
    const beat = Math.floor((step % 16) / 4);
    const sixteenth = (step % 16) % 4;
    const time = `${bar}:${beat}:${sixteenth}`;

    const isActive = pattern.some((p) => p.time === time && p.note === note);

    if (isActive) onRemoveNote(time, note);
    else onAddNote(time, note, "16n");
  };

  return (
    <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-[#1f1f1f] p-4">
      <div className="flex flex-1 overflow-auto border border-neutral-800">
        {/* Keyboard - fixed left side */}
        <div className="w-16 bg-[#252525] border-r border-neutral-800 flex-shrink-0">
          {notes.map((note) => (
            <div
              key={note}
              className={`h-7 flex items-center pl-3 text-xs border-b border-neutral-800
                ${note.includes("#") ? "text-neutral-400" : "font-medium text-white"}`}
            >
              {note}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div
          className="grid gap-px bg-neutral-800 select-none"
          style={{
            gridTemplateColumns: `repeat(${totalSteps}, 28px)`,
            gridTemplateRows: `repeat(${notes.length}, 28px)`,
          }}
          onClick={handleClick}
        >
          {notes.flatMap((note, noteIndex) =>
            Array.from({ length: totalSteps }, (_, step) => {
              const bar = Math.floor(step / 16);
              const beat = Math.floor((step % 16) / 4);
              const sixteenth = (step % 16) % 4;
              const time = `${bar}:${beat}:${sixteenth}`;

              const isActive = pattern.some(
                (p) => p.time === time && p.note === note,
              );

              return (
                <button
                  key={`${note}-${step}`}
                  data-step={step}
                  data-note-index={noteIndex}
                  className={`border border-neutral-700 w-[28px] 
                    ${isActive ? "bg-violet-500 border-violet-400" : "bg-[#2a2a2a] hover:bg-neutral-700"}`}
                />
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}
