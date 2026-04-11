import * as Tone from "tone";

import { type Track } from "@/types";

export const positionToArray = (position: Tone.Unit.Time) =>
  position.toString().split(":").map(Number);

export const forwardPosition = (position: Tone.Unit.Time) => {
  const [bars] = positionToArray(position);
  return `${bars + 1}:0:0`;
};

export const backwardPosition = (position: Tone.Unit.Time) => {
  const [bars, beats] = positionToArray(position);
  if (bars === 0) {
    return position;
  }
  if (beats !== 0) {
    return `${bars}:0:0`;
  }
  return `${bars - 1}:0:0`;
};

export const formatPosition = (position: Tone.Unit.Time): Position => {
  const [bars, beats, sixteenths] = String(position)
    .split(":")
    .map((val) => Number(val.split(".")[0]) || 0);
  return { bars, beats: beats + 1, sixteenths: sixteenths + 1 };
};

export type Position = {
  bars: number;
  beats: number;
  sixteenths: number;
};

export const positionToBeats = (position: Tone.Unit.Time) => {
  const [bars, beats] = position.toString().split(":").map(Number);
  const numBeats = bars * 4 + beats + 1;
  return numBeats;
};

export const positionToSixteenths = (position: Tone.Unit.Time) => {
  const [bars, beats, sixteenths] = position.toString().split(":").map(Number);
  const numSixteenths = bars * 16 + beats * 4 + sixteenths + 1;
  return numSixteenths;
};

export const getLastBar = (tracks: Track[]) => {
  const arr = tracks.flatMap((t) => t.durations.map((d) => d.stop));
  return Math.max(...arr);
};

export const cleanPosition = (position: Tone.Unit.Time) => {
  const [bars, beats] = position.toString().split(":").map(Number);
  return `${bars}:${beats + 1}:0`;
};

export const positionDiff = (
  positionA: Tone.Unit.Time,
  positionB: Tone.Unit.Time,
) => {
  const [barsA, beatsA] = positionA.toString().split(":").map(Number);
  const [barsB, beatsB] = positionB.toString().split(":").map(Number);
  return `${barsA - barsB}:${beatsA - beatsB}:0`;
};

export const toPosition = (bars: number, beats = 0) => {
  return `${bars}:${beats}:0`;
};

export const barsToEndTime = (bars: number) => {
  return Tone.TransportTime(`${bars}m`).toSeconds() - 0.001;
};

export const isPositionZero = (position: Tone.Unit.Time): boolean => {
  return position.toString().includes("0:0:0");
};

export const calcVolumeLevel = (volumePercent: number) => {
  return -30 + (volumePercent / 100) * 30;
};

export const roundPosition = (position: Tone.Unit.Time) => {
  const [bars, beats, sixteenths] = position.toString().split(":").map(Number);
  const [six] = sixteenths.toString().split(".");
  return `${bars}:${beats}:${six}`;
};

export const getTracksStateKey = (stackId: string) => `local-tracks-${stackId}`;
