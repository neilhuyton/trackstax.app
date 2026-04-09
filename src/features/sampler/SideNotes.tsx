import type { NoteName } from "@/types";
import { useEffect, useRef, useCallback } from "react";

type Props = {
  notes: readonly NoteName[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  trigger?: (note: string, duration?: string) => void;
};

export default function SideNotes({ notes, scrollRef, trigger }: Props) {
  const keyboardRef = useRef<HTMLDivElement>(null);

  const playNote = useCallback(
    (note: NoteName) => {
      trigger?.(note, "8n");
    },
    [trigger],
  );

  // Sync vertical scroll with grid
  useEffect(() => {
    const grid = scrollRef.current;
    const keyboard = keyboardRef.current;
    if (!grid || !keyboard) return;

    const syncScroll = () => {
      keyboard.scrollTop = grid.scrollTop;
    };

    grid.addEventListener("scroll", syncScroll, { passive: true });

    return () => grid.removeEventListener("scroll", syncScroll);
  }, [scrollRef]);

  // Scroll to middle of keyboard on mount
  useEffect(() => {
    const keyboard = keyboardRef.current;
    if (!keyboard) return;

    const middlePosition = (keyboard.scrollHeight - keyboard.clientHeight) / 2;
    keyboard.scrollTop = middlePosition;
  }, []);

  const isBlackKey = (note: NoteName): boolean =>
    note.includes("#") || note.includes("b");

  return (
    <div className="w-16 bg-black flex-shrink-0 border-r border-neutral-800 overflow-hidden">
      <div ref={keyboardRef} className="h-full overflow-hidden">
        {notes.map((note) => {
          const isBlack = isBlackKey(note);

          return (
            <button
              key={note}
              onClick={() => playNote(note)}
              className={`
                h-[28px] w-full flex items-center pl-3 text-sm 
                cursor-pointer select-none transition-colors border-b border-neutral-800
                ${
                  isBlack
                    ? "bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 text-white"
                    : "bg-white hover:bg-zinc-100 active:bg-violet-100 text-neutral-900"
                }
              `}
            >
              <span className="font-mono relative z-10">{note}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
