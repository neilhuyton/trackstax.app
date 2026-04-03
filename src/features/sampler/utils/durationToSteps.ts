// src/features/sampler/utils/durationToSteps.ts

export function durationToSteps(duration: string = "16n"): number {
  if (!duration) return 1;

  // Dotted notes
  if (duration.endsWith(".")) {
    const base = duration.slice(0, -1);
    return (getBaseSteps(base) ?? 1) * 1.5;
  }

  // Triplet notes - VISUAL SPAN (what you want on the grid)
  if (duration.endsWith("t")) {
    const base = duration.slice(0, -1);

    if (base === "8") return 3; // 8t  = 3 × 16th notes  ← This is what you want
    if (base === "4") return 8; // 4t  = 8 steps (approx)
    if (base === "16") return 2; // 16t = 2 steps (approx)

    return 2; // fallback
  }

  // Normal notes
  return getBaseSteps(duration);
}

function getBaseSteps(subdivision: string): number {
  const map: Record<string, number> = {
    "1m": 16,
    "2n": 8,
    "4n": 4,
    "8n": 2,
    "16n": 1,
    "32n": 0.5,
  };
  return map[subdivision] ?? 1;
}
