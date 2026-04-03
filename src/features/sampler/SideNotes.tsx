import type { NoteName } from "@/types";
import { useEffect, useRef } from "react";

type Props = {
  notes: readonly NoteName[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  trigger?: (note: string, duration?: string) => void;
};

export default function SideNotes({ notes, scrollRef, trigger }: Props) {
  const keyboardRef = useRef<HTMLDivElement>(null);

  const playNote = (note: NoteName) => {
    trigger?.(note, "8n");
  };

  useEffect(() => {
    const grid = scrollRef.current;
    const keyboard = keyboardRef.current;
    if (!grid || !keyboard) return;

    const syncScroll = () => {
      keyboard.scrollTop = grid.scrollTop;
    };

    grid.addEventListener("scroll", syncScroll);
    return () => grid.removeEventListener("scroll", syncScroll);
  }, [scrollRef]);

  return (
    <div className="w-16 bg-black flex-shrink-0 overflow-hidden">
      <div ref={keyboardRef} className="h-full overflow-hidden">
        {notes.map((note) => (
          <div
            key={note}
            className="h-[28px] border-b border-gray-800 flex items-center pl-2 text-sm cursor-pointer hover:bg-zinc-800 active:bg-violet-600 transition-colors"
            onClick={() => playNote(note)}
          >
            {note}
          </div>
        ))}
      </div>
    </div>
  );
}
