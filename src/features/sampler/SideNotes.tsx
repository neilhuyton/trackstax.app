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

  // Sync vertical scroll between grid and keyboard
  useEffect(() => {
    const grid = scrollRef.current;
    const keyboard = keyboardRef.current;
    if (!grid || !keyboard) return;

    const syncScroll = () => {
      keyboard.scrollTop = grid.scrollTop;
    };

    grid.addEventListener("scroll", syncScroll, { passive: true });

    return () => {
      grid.removeEventListener("scroll", syncScroll);
    };
  }, [scrollRef]);

  return (
    <div className="w-16 bg-black flex-shrink-0 border-r border-neutral-800 overflow-hidden">
      <div ref={keyboardRef} className="h-full overflow-hidden">
        {notes.map((note) => (
          <button
            key={note}
            onClick={() => playNote(note)}
            className="h-[28px] w-full border-b border-gray-800 flex items-center pl-3 text-sm 
                       cursor-pointer hover:bg-zinc-800 active:bg-violet-600 
                       transition-colors select-none"
          >
            {note}
          </button>
        ))}
      </div>
    </div>
  );
}
