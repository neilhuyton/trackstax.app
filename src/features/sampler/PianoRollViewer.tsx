import { useRef, useEffect } from "react";
import SideNotes from "./SideNotes";
import DrawGrid from "./DrawGrid";
import PianoRollBars from "./PianoRollBars";
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
  currentBar?: number;
  loopLength: number;
};

export default function PianoRollViewer({
  pattern,
  onAddNote,
  onRemoveNote,
  trigger,
  currentBar,
  loopLength,
}: Props) {
  const gridScrollRef = useRef<HTMLDivElement>(null);
  const headerScrollRef = useRef<HTMLDivElement>(null);

  const lines = pattern.map((event) => eventToLine(event, TOTAL_STEPS));

  const handleLineComplete = (
    rowIndex: number,
    startStep: number,
    endStep: number,
  ) => {
    const result = lineToEvent(rowIndex, startStep, endStep);

    if (!result) {
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

    onAddNote(result.time, result.note, result.duration);
  };

  // Sync horizontal scroll between header and grid
  useEffect(() => {
    const grid = gridScrollRef.current;
    const header = headerScrollRef.current;
    if (!grid || !header) return;

    let rafId: number;

    const syncHeader = () => {
      if (header.scrollLeft !== grid.scrollLeft) {
        header.scrollLeft = grid.scrollLeft;
      }
    };

    const syncGrid = () => {
      if (grid.scrollLeft !== header.scrollLeft) {
        grid.scrollLeft = header.scrollLeft;
      }
    };

    const throttledSyncHeader = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(syncHeader);
    };

    const throttledSyncGrid = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(syncGrid);
    };

    grid.addEventListener("scroll", throttledSyncHeader, { passive: true });
    header.addEventListener("scroll", throttledSyncGrid, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      grid.removeEventListener("scroll", throttledSyncHeader);
      header.removeEventListener("scroll", throttledSyncGrid);
    };
  }, []);

  // Scroll main grid vertically to middle on first load to match SideNotes
  useEffect(() => {
    const grid = gridScrollRef.current;
    if (!grid) return;

    const timeoutId = setTimeout(() => {
      const middlePosition = (grid.scrollHeight - grid.clientHeight) / 2;
      if (middlePosition > 0) {
        grid.scrollTop = middlePosition;
      }
    }, 50);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PianoRollBars
        currentBar={currentBar}
        loopLength={loopLength}
        ref={headerScrollRef}
      />

      <div className="flex flex-1 overflow-hidden">
        <SideNotes
          notes={NOTE_NAMES}
          scrollRef={gridScrollRef}
          trigger={trigger}
        />
        <DrawGrid
          ref={gridScrollRef}
          notes={NOTE_NAMES}
          totalSteps={TOTAL_STEPS}
          lines={lines}
          onLineComplete={handleLineComplete}
          loopLength={loopLength}
        />
      </div>
    </div>
  );
}
