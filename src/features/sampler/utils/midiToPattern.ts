import { Midi } from "@tonejs/midi";
import type { SamplerEvent, NoteName } from "@/types";
import { NOTE_NAMES } from "@/types";

const getNoteName = (midiNote: number): NoteName => {
  const standardNames = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];

  const octave = Math.floor(midiNote / 12) - 1;
  const pitchClass = midiNote % 12;
  const base = standardNames[pitchClass];

  const candidate = `${base}${octave}` as NoteName;

  if (NOTE_NAMES.includes(candidate)) {
    return candidate;
  }

  // Fallback
  return "C4" as NoteName;
};

export const midiToSamplerPattern = async (
  file: File,
): Promise<SamplerEvent[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const midi = new Midi(arrayBuffer);

  const events: SamplerEvent[] = [];
  const track = midi.tracks.find((t) => t.notes.length > 0) || midi.tracks[0];

  if (!track) {
    return [];
  }

  const ppq = midi.header.ppq;
  const ticksPerBar = ppq * 4;

  track.notes.forEach((note) => {
    // Time conversion: ticks → bars:beats:sixteenths
    const bar = Math.floor(note.ticks / ticksPerBar);
    const ticksInBar = note.ticks % ticksPerBar;
    const beat = Math.floor(ticksInBar / ppq);
    const ticksInBeat = ticksInBar % ppq;
    const sixteenth = Math.floor((ticksInBeat / ppq) * 4);

    const timeString = `${bar}:${beat}:${sixteenth}`;

    // Duration conversion
    const durBar = Math.floor(note.durationTicks / ticksPerBar);
    const durTicksInBar = note.durationTicks % ticksPerBar;
    const durBeat = Math.floor(durTicksInBar / ppq);
    const durSixteenth = Math.floor(((durTicksInBar % ppq) / ppq) * 4);

    let durationString = `${durBar}:${durBeat}:${durSixteenth}`;

    // Minimum duration = 1 sixteenth
    if (note.durationTicks < ppq / 4) {
      durationString = "0:0:1";
    }

    const noteName = getNoteName(note.midi);

    const event: SamplerEvent = {
      time: timeString,
      note: noteName,
      duration: durationString,
    };

    events.push(event);
  });

  // Sort by time
  const sortedEvents = events.sort((a, b) => {
    const [ba, bea, sa] = a.time.split(":").map(Number);
    const [bb, beb, sb] = b.time.split(":").map(Number);
    return ba - bb || bea - beb || sa - sb;
  });

  return sortedEvents;
};
