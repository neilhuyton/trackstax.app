export function durationToSteps(duration: string = "16n"): number {
  if (!duration) return 1;

  if (duration.endsWith(".")) {
    const base = duration.slice(0, -1);
    return (getBaseSteps(base) ?? 1) * 1.5;
  }

  if (duration.endsWith("t")) {
    const base = duration.slice(0, -1);
    if (base === "8") return 3;
    if (base === "4") return 8;
    if (base === "16") return 2;
    if (base === "2") return 12;
    return 3;
  }

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
