import { useRef } from "react";
import SideNotes from "./SideNotes";
import NoteGrid from "./NoteGrid";
import type { SamplerEvent } from "@/types";
import { NOTE_NAMES } from "@/types";

const BAR_COUNT = 8;

type Props = {
  pattern: SamplerEvent[];
  onAddNote: (time: string, note: string, duration?: string) => void;
  onRemoveNote: (time: string, note: string) => void;
  trigger?: (note: string, duration?: string) => void;
};

export default function PianoRollViewer({
  pattern,
  onAddNote,
  onRemoveNote,
  trigger,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const totalSteps = BAR_COUNT * 16;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <SideNotes notes={NOTE_NAMES} scrollRef={scrollRef} trigger={trigger} />
        <NoteGrid
          pattern={pattern}
          notes={NOTE_NAMES}
          totalSteps={totalSteps}
          onAddNote={onAddNote}
          onRemoveNote={onRemoveNote}
          ref={scrollRef}
        />
      </div>
    </div>
  );
}
