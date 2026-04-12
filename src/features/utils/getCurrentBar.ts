import * as Tone from "tone";

export const getCurrentTransportBar = (): number => {
  try {
    const position = Tone.getTransport().position;
    if (typeof position !== "string" || !position.includes(":")) {
      return -1;
    }
    const [barsStr] = position.split(":");
    const bar = parseInt(barsStr, 10);
    return isNaN(bar) ? -1 : bar;
  } catch {
    return -1;
  }
};
