import { useRef, useEffect, useCallback, useState } from "react";
import type { Line, NoteName } from "@/types";

import { redrawPianoRollCanvas } from "../utils/pianoRollCanvasUtils";

type UseDrawGridProps = {
  notes: readonly NoteName[];
  totalSteps: number;
  pixelSize?: number;
  lines: readonly Line[];
  onLineComplete: (
    rowIndex: number,
    startStep: number,
    endStep: number,
  ) => void;
  onLongPress: (
    rowIndex: number,
    step: number,
    clientX: number,
    clientY: number,
  ) => void;
};

export function useDrawGrid({
  notes,
  totalSteps,
  pixelSize = 28,
  lines,
  onLineComplete,
  onLongPress,
}: UseDrawGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isDrawingRef = useRef(false);
  const lockedRowRef = useRef<number | null>(null);
  const minColRef = useRef(0);
  const maxColRef = useRef(0);

  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const [selectedCell, setSelectedCell] = useState<{
    rowIndex: number;
    step: number;
  } | null>(null);

  const getGridPos = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { step: -1, rowIndex: -1 };

      const rect = canvas.getBoundingClientRect();
      const step = Math.floor((clientX - rect.left) / pixelSize);
      const rowIndex = Math.floor((clientY - rect.top) / pixelSize);

      return {
        step: Math.max(0, Math.min(totalSteps - 1, step)),
        rowIndex: Math.max(0, Math.min(notes.length - 1, rowIndex)),
      };
    },
    [pixelSize, totalSteps, notes.length],
  );

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const handleTapOrHold = useCallback(
    (clientX: number, clientY: number, isHold: boolean) => {
      const pos = getGridPos(clientX, clientY);

      const existing = lines.find(
        (l) =>
          l.rowIndex === pos.rowIndex &&
          pos.step >= l.startStep &&
          pos.step <= l.endStep,
      );

      if (existing) {
        onLineComplete(
          pos.rowIndex,
          existing.startStep,
          existing.startStep - 1,
        );
        return;
      }

      if (isHold) {
        setSelectedCell({ rowIndex: pos.rowIndex, step: pos.step });
        onLongPress(pos.rowIndex, pos.step, clientX, clientY);
        return;
      }
    },
    [getGridPos, lines, onLineComplete, onLongPress],
  );

  const finishDrawing = useCallback(
    (finalClientX?: number, finalClientY?: number) => {
      if (!isDrawingRef.current || lockedRowRef.current === null) return;

      let endStep = maxColRef.current;

      if (finalClientX !== undefined && finalClientY !== undefined) {
        const finalPos = getGridPos(finalClientX, finalClientY);
        if (finalPos.step >= 0) {
          endStep = Math.max(maxColRef.current, finalPos.step);
        }
      }

      const start = Math.min(minColRef.current, endStep);
      const end = Math.max(minColRef.current, endStep);

      onLineComplete(lockedRowRef.current, start, end);

      isDrawingRef.current = false;
      lockedRowRef.current = null;
      minColRef.current = 0;
      maxColRef.current = 0;
    },
    [getGridPos, onLineComplete],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    redrawPianoRollCanvas(
      canvas,
      lines,
      selectedCell,
      notes,
      totalSteps,
      pixelSize,
    );
  }, [lines, selectedCell, notes, totalSteps, pixelSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isDrawing = false;

    const handlePointerDown = (e: PointerEvent) => {
      touchStartRef.current = { x: e.clientX, y: e.clientY };
      clearHoldTimer();

      holdTimerRef.current = setTimeout(() => {
        if (touchStartRef.current) {
          isDrawing = true;
          handleTapOrHold(e.clientX, e.clientY, true);
        }
      }, 160);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isDrawing) {
        e.preventDefault();
      } else if (touchStartRef.current) {
        const dx = Math.abs(e.clientX - touchStartRef.current.x);
        const dy = Math.abs(e.clientY - touchStartRef.current.y);

        if (dx > 4 || dy > 4) {
          clearHoldTimer();
        }
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      clearHoldTimer();

      if (isDrawing) {
        e.preventDefault();
        finishDrawing(e.clientX, e.clientY);
        isDrawing = false;
      } else if (touchStartRef.current) {
        handleTapOrHold(
          touchStartRef.current.x,
          touchStartRef.current.y,
          false,
        );
      }

      touchStartRef.current = null;
    };

    canvas.addEventListener("pointerdown", handlePointerDown, {
      passive: false,
    });
    canvas.addEventListener("pointermove", handlePointerMove, {
      passive: false,
    });
    canvas.addEventListener("pointerup", handlePointerUp, { passive: false });
    canvas.addEventListener("pointerleave", handlePointerUp, {
      passive: false,
    });
    canvas.addEventListener("pointercancel", handlePointerUp, {
      passive: false,
    });

    canvas.style.touchAction = "pan-x pan-y";

    return () => {
      clearHoldTimer();
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointerleave", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [handleTapOrHold, finishDrawing, clearHoldTimer]);

  return { canvasRef, setSelectedCell };
}
