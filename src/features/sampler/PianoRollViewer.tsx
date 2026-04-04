import { useRef, useEffect } from "react";
import SideNotes from "./SideNotes";
import type { SamplerEvent, NoteName } from "@/types";
import { NOTE_NAMES } from "@/types";
import DrawGrid from "./DrawGrid";
import PianoRollHeader from "./PianoRollHeader";

const BAR_COUNT = 8;

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
  const totalSteps = BAR_COUNT * 16;

  const lines = pattern.map((event) => {
    const [bar, beat, sixteenth] = event.time.split(":").map(Number);
    const startStep = bar * 16 + beat * 4 + sixteenth;
    const durationSteps = parseDurationToSteps(event.duration || "16n");
    const endStep = Math.min(totalSteps - 1, startStep + durationSteps - 1);

    return {
      rowIndex: NOTE_NAMES.indexOf(event.note as NoteName),
      startStep: Math.max(0, startStep),
      endStep,
    };
  });

  const handleLineComplete = (
    rowIndex: number,
    startStep: number,
    endStep: number,
  ) => {
    const note = NOTE_NAMES[rowIndex];
    if (!note) return;

    if (startStep > endStep) {
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

    const bar = Math.floor(startStep / 16);
    const beat = Math.floor((startStep % 16) / 4);
    const sixteenth = startStep % 4;
    const time = `${bar}:${beat}:${sixteenth}`;

    const durationSteps = endStep - startStep + 1;
    const duration = stepsToDuration(durationSteps);

    onAddNote(time, note, duration);
  };

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
        <SideNotes notes={NOTE_NAMES} scrollRef={gridScrollRef} trigger={trigger} />
        <DrawGrid
          notes={NOTE_NAMES}
          totalSteps={totalSteps}
          lines={lines}
          onLineComplete={handleLineComplete}
          ref={gridScrollRef}
        />
      </div>
    </div>
  );
}

function parseDurationToSteps(duration: string): number {
  switch (duration) {
    case "8n":
      return 2;
    case "4n":
      return 4;
    case "2n":
      return 8;
    case "1n":
      return 16;
    default:
      return 1;
  }
}

function stepsToDuration(steps: number): string {
  if (steps >= 16) return "1n";
  if (steps >= 8) return "2n";
  if (steps >= 4) return "4n";
  if (steps >= 2) return "8n";
  return "16n";
}