import { useRef, useEffect } from "react";
import SideNotes from "./SideNotes";
import DrawGrid from "./DrawGrid";
import PianoRollHeader from "./PianoRollHeader";
import type { NoteName, SamplerEvent } from "@/types";
import { NOTE_NAMES } from "@/types";

import {
  eventToLine,
  lineToEvent,
} from "@/features/sampler/utils/pianoRollUtils";

const BAR_COUNT = 8;
const TOTAL_STEPS = BAR_COUNT * 16;

type Props = {
  pattern: SamplerEvent[];
  onAddNote: (time: string, note: string, duration?: string) => void;
  onRemoveNote: (time: string, note: string) => void;
  trigger?: (note: string, duration?: string) => void;
  currentBar: number;
};

export default function PianoRollViewer({
  pattern,
  onAddNote,
  onRemoveNote,
  trigger,
  currentBar,
}: Props) {
  const gridScrollRef = useRef<HTMLDivElement>(null);
  const headerScrollRef = useRef<HTMLDivElement>(null);

  // Convert pattern events to visual lines
  const lines = pattern.map((event) => eventToLine(event, TOTAL_STEPS));

  const handleLineComplete = (
    rowIndex: number,
    startStep: number,
    endStep: number,
  ) => {
    const result = lineToEvent(rowIndex, startStep, endStep);

    if (!result) {
      // Handle removal
      const eventToRemove = pattern.find((p) => {
        const [bar, beat, sixteenth] = p.time.split(":").map(Number);
        const eventStartStep = bar * 16 + beat * 4 + sixteenth;

        return (
          NOTE_NAMES.indexOf(p.note as NoteName) === rowIndex &&
          eventStartStep === startStep
        );
      });

      if (eventToRemove) {
        onRemoveNote(eventToRemove.time, eventToRemove.note);
      }
      return;
    }

    // Handle addition
    onAddNote(result.time, result.note, result.duration);
  };

  // Sync scroll between header and grid
  useEffect(() => {
    const grid = gridScrollRef.current;
    const header = headerScrollRef.current;
    if (!grid || !header) return;

    const syncHeader = () => {
      header.scrollLeft = grid.scrollLeft;
    };

    grid.addEventListener("scroll", syncHeader, { passive: true });

    return () => grid.removeEventListener("scroll", syncHeader);
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PianoRollHeader currentBar={currentBar} ref={headerScrollRef} />

      <div className="flex flex-1 overflow-hidden">
        <SideNotes
          notes={NOTE_NAMES}
          scrollRef={gridScrollRef}
          trigger={trigger}
        />
        <DrawGrid
          notes={NOTE_NAMES}
          totalSteps={TOTAL_STEPS}
          lines={lines}
          onLineComplete={handleLineComplete}
          ref={gridScrollRef}
        />
      </div>
    </div>
  );
}
