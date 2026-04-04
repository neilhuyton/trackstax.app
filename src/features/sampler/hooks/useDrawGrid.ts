import { useRef, useEffect, useCallback } from "react";
import type { NoteName } from "@/types";

type Line = {
  rowIndex: number;
  startStep: number;
  endStep: number;
};

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
};

const HOLD_DELAY = 200;
const MOVE_THRESHOLD = 15;

export function useDrawGrid({
  notes,
  totalSteps,
  pixelSize = 28,
  lines,
  onLineComplete,
}: UseDrawGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isDrawingRef = useRef(false);
  const lockedRowRef = useRef<number | null>(null);
  const minColRef = useRef(0);
  const maxColRef = useRef(0);

  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const rows = notes.length;
  const cols = totalSteps;
  const canvasWidth = cols * pixelSize;
  const canvasHeight = rows * pixelSize;

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Background with alternating bar colors
    for (let bar = 0; bar < Math.ceil(cols / 16); bar++) {
      const isEvenBar = bar % 2 === 0;
      const barStartX = bar * 16 * pixelSize;
      const barWidth = Math.min(16 * pixelSize, canvasWidth - barStartX);

      ctx.fillStyle = isEvenBar ? "#18181b" : "#1f1f23";
      ctx.fillRect(barStartX, 0, barWidth, canvasHeight);
    }

    // Grid lines
    ctx.strokeStyle = "#3f3f46";
    ctx.lineWidth = 1;

    for (let x = 0; x <= cols; x++) {
      ctx.beginPath();
      ctx.moveTo(x * pixelSize, 0);
      ctx.lineTo(x * pixelSize, canvasHeight);
      ctx.stroke();
    }
    for (let y = 0; y <= rows; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * pixelSize);
      ctx.lineTo(canvasWidth, y * pixelSize);
      ctx.stroke();
    }

    // Notes
    ctx.fillStyle = "#8b5cf6";
    lines.forEach((line) => {
      const startX = line.startStep * pixelSize;
      const width = (line.endStep - line.startStep + 1) * pixelSize;
      const y = line.rowIndex * pixelSize;

      ctx.fillRect(startX + 1, y + 1, width - 2, pixelSize - 2);
    });
  }, [lines, cols, rows, pixelSize]);

  const drawPixel = useCallback(
    (step: number, rowIndex: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const x = step * pixelSize;
      const y = rowIndex * pixelSize;

      ctx.fillStyle = "#8b5cf6";
      ctx.fillRect(x + 1, y + 1, pixelSize - 2, pixelSize - 2);
    },
    [pixelSize],
  );

  const getGridPos = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { step: -1, rowIndex: -1 };

      const rect = canvas.getBoundingClientRect();
      const step = Math.floor((clientX - rect.left) / pixelSize);
      const rowIndex = Math.floor((clientY - rect.top) / pixelSize);

      return {
        step: Math.max(0, Math.min(cols - 1, step)),
        rowIndex: Math.max(0, Math.min(rows - 1, rowIndex)),
      };
    },
    [pixelSize, cols, rows],
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
        isDrawingRef.current = true;
        lockedRowRef.current = pos.rowIndex;
        minColRef.current = pos.step;
        maxColRef.current = pos.step;
        drawPixel(pos.step, pos.rowIndex);
      }
    },
    [getGridPos, lines, onLineComplete, drawPixel],
  );

  const onMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDrawingRef.current || lockedRowRef.current === null) return;

      const { step } = getGridPos(clientX, clientY);
      if (step < 0) return;

      const lockedRow = lockedRowRef.current;
      const newMin = Math.min(minColRef.current, step);
      const newMax = Math.max(maxColRef.current, step);

      for (let s = newMin; s <= newMax; s++) {
        drawPixel(s, lockedRow);
      }

      minColRef.current = newMin;
      maxColRef.current = newMax;
    },
    [getGridPos, drawPixel],
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
    redrawCanvas();
  }, [redrawCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];

      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      clearHoldTimer();

      holdTimerRef.current = setTimeout(() => {
        if (touchStartRef.current) {
          handleTapOrHold(touch.clientX, touch.clientY, true);
        }
      }, HOLD_DELAY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];

      if (isDrawingRef.current) {
        e.preventDefault();
        onMove(touch.clientX, touch.clientY);
      } else if (touchStartRef.current) {
        const dx = Math.abs(touch.clientX - touchStartRef.current.x);
        const dy = Math.abs(touch.clientY - touchStartRef.current.y);
        if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
          clearHoldTimer();
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      clearHoldTimer();

      const lastTouch = e.changedTouches?.[0];
      if (!lastTouch) return;

      if (isDrawingRef.current) {
        finishDrawing(lastTouch.clientX, lastTouch.clientY);
      } else if (touchStartRef.current) {
        handleTapOrHold(lastTouch.clientX, lastTouch.clientY, false);
      }

      touchStartRef.current = null;
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: true });
    canvas.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      clearHoldTimer();
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      canvas.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [handleTapOrHold, onMove, finishDrawing, clearHoldTimer]);

  return { canvasRef };
}
