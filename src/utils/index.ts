// utils/index.ts
import * as Tone from "tone";

import { type Track } from "@/types";

// const sortDurations = (durations: Duration[]) =>
//   durations.sort((a, b) => a.start - b.start);

// const getSpan = (durations: Duration[], selectedBar: number) =>
//   durations.find(
//     (item: Duration) => item.start <= selectedBar && item.stop > selectedBar
//   );

// const getSpanIndex = (durations: Duration[], selectedBar: number) =>
//   durations.findIndex(
//     (item: Duration) => item.start <= selectedBar && item.stop > selectedBar
//   );

// const getPrevious = (durations: Duration[], selectedBar: number) =>
//   durations.findIndex((item: Duration) => item.stop === selectedBar);

// const getNext = (durations: Duration[], selectedBar: number) =>
//   durations.findIndex((item: Duration) => item.start === selectedBar + 1);

// const processSetToActive = (durations: Duration[], selectedBar: number) => {
//   const previousIndex = getPrevious(durations, selectedBar);
//   const nextIndex = getNext(durations, selectedBar);

//   const previousItem = durations[previousIndex];
//   const nextItem = durations[nextIndex];

//   const start = selectedBar;
//   const stop = selectedBar + 1;

//   if (previousItem && nextItem) {
//     const clonePrevious = { ...durations[previousIndex] };
//     const cloneNext = { ...durations[nextIndex] };
//     durations.splice(nextIndex, 1);

//     durations[previousIndex] = {
//       ...clonePrevious,
//       stop: cloneNext.stop,
//     };
//   } else if (previousItem) {
//     durations[previousIndex] = {
//       ...durations[previousIndex],
//       stop,
//     };
//   } else if (nextItem) {
//     durations[nextIndex] = {
//       ...durations[nextIndex],
//       start,
//     };
//   } else {
//     durations.push({ start, stop });
//   }

//   return durations;
// };

// const processSetToInactive = (durations: Duration[], selectedBar: number) => {
//   const findSpanIndex = getSpanIndex(durations, selectedBar);
//   const durationToSplit = { ...durations[findSpanIndex] };
//   const lengthOfSpan = durationToSplit.stop - durationToSplit.start;

//   // improve by looping from durationToSplit.start to stop, checking if index === selectedBar

//   // removes single items
//   if (lengthOfSpan === 1) {
//     durations.splice(findSpanIndex, 1);
//   }

//   // removes start items
//   else if (durationToSplit.start === selectedBar) {
//     durations[findSpanIndex] = {
//       ...durationToSplit,
//       start: selectedBar + 1,
//     };
//   }

//   // removes end items
//   else if (durationToSplit.stop === selectedBar + 1) {
//     durations[findSpanIndex] = {
//       ...durationToSplit,
//       stop: selectedBar,
//     };
//   }

//   // splits an existing span
//   else if (durationToSplit.stop > selectedBar) {
//     durations[findSpanIndex] = {
//       ...durationToSplit,
//       stop: selectedBar,
//     };

//     durations.push({
//       start: selectedBar + 1,
//       stop: durationToSplit.stop,
//     });
//   }

//   return durations;
// };

// export const sanitiseDurations = (
//   durations: Duration[],
//   selectedBar: number,
//   isActive: boolean
// ): Duration[] => {
//   let newDurations = [...durations];

//   newDurations = newDurations.sort((a, b) => a.start - b.start);

//   let result: Duration[] = [];

//   if (!isActive) {
//     const findSpan = getSpan(newDurations, selectedBar);
//     if (findSpan) {
//       return [...newDurations];
//     }

//     result = processSetToActive(newDurations, selectedBar);
//   } else {
//     result = processSetToInactive(newDurations, selectedBar);
//   }

//   return sortDurations([...result]);
// };

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

export const positionToEndTime = (position: Tone.Unit.Time) => {
  return Tone.TransportTime(position).toSeconds() - 0.001;
};

export const positionToTest = (position: Tone.Unit.Time) => {
  return Tone.TransportTime(position).toSeconds() + 0.01;
};

export const positionToTime = (position: Tone.Unit.Time) => {
  return Tone.TransportTime(position).toSeconds();
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
