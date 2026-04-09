import type { Line } from "@/types";

export function redrawPianoRollCanvas(
  canvas: HTMLCanvasElement,
  lines: readonly Line[],
  selectedCell: { rowIndex: number; step: number } | null,
  notes: readonly string[],
  totalSteps: number,
  pixelSize: number,
  loopLength: number = 4,
) {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;

  const cols = totalSteps;
  const rows = notes.length;
  const canvasWidth = cols * pixelSize;
  const canvasHeight = rows * pixelSize;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const activeSteps = loopLength * 16;

  // Background bars
  for (let bar = 0; bar < Math.ceil(cols / 16); bar++) {
    const isEvenBar = bar % 2 === 0;
    const barStartX = bar * 16 * pixelSize;
    const barWidth = Math.min(16 * pixelSize, canvasWidth - barStartX);

    const isDisabled = bar >= loopLength;

    ctx.fillStyle = isDisabled ? "#111113" : isEvenBar ? "#18181b" : "#1f1f23";

    ctx.fillRect(barStartX, 0, barWidth, canvasHeight);
  }

  // Bar separators
  ctx.strokeStyle = "#52525b";
  ctx.lineWidth = 2;
  for (let bar = 0; bar <= Math.ceil(cols / 16); bar++) {
    const x = bar * 16 * pixelSize;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight);
    ctx.stroke();
  }

  // Beat separators
  ctx.strokeStyle = "#3f3f46";
  ctx.lineWidth = 1;
  for (let beat = 0; beat <= cols; beat += 4) {
    if (beat % 16 === 0) continue;
    const x = beat * pixelSize;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight);
    ctx.stroke();
  }

  // Sixteenth grid lines
  ctx.strokeStyle = "#27272a";
  ctx.lineWidth = 1;
  for (let x = 0; x <= cols; x++) {
    if (x % 4 === 0) continue;
    ctx.beginPath();
    ctx.moveTo(x * pixelSize, 0);
    ctx.lineTo(x * pixelSize, canvasHeight);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = 0; y <= rows; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * pixelSize);
    ctx.lineTo(canvasWidth, y * pixelSize);
    ctx.stroke();
  }

  // Full row + column highlight (only in active area)
  if (selectedCell && selectedCell.step < activeSteps) {
    const x = selectedCell.step * pixelSize;
    const y = selectedCell.rowIndex * pixelSize;

    ctx.fillStyle = "rgba(139, 92, 246, 0.08)";
    ctx.fillRect(0, y, canvasWidth, pixelSize);
    ctx.fillRect(x, 0, pixelSize, canvasHeight);

    ctx.fillStyle = "rgba(139, 92, 246, 0.25)";
    ctx.fillRect(x, y, pixelSize, pixelSize);

    ctx.strokeStyle = "#c4b5fd";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(x + 1, y + 1, pixelSize - 2, pixelSize - 2);
  }

  // Notes (dimmed if beyond loop length)
  lines.forEach((line) => {
    const startX = line.startStep * pixelSize;
    const width = (line.endStep - line.startStep + 1) * pixelSize;
    const y = line.rowIndex * pixelSize;

    const isNoteDisabled = line.startStep >= activeSteps;

    ctx.fillStyle = isNoteDisabled ? "#4b5563" : "#8b5cf6";
    ctx.fillRect(startX + 1, y + 1, width - 2, pixelSize - 2);
  });

  // Disabled overlay (semi-transparent dark cover on inactive bars)
  if (activeSteps < cols) {
    const disabledStartX = activeSteps * pixelSize;
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(disabledStartX, 0, canvasWidth - disabledStartX, canvasHeight);
  }
}
