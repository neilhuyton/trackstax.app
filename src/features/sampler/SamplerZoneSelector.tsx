import { useState } from "react";
import type { Track } from "@/types";
import { NOTE_NAMES } from "@/types";
import { useNavigate } from "@tanstack/react-router";

type Props = {
  trackId: string;
  stackId: string;
  samplerTrack: Track;
};

export default function SamplerZoneSelector({
  trackId,
  stackId,
  samplerTrack,
}: Props) {
  const navigate = useNavigate();

  const [lowNote, setLowNote] = useState<string | null>(null);
  const [highNote, setHighNote] = useState<string | null>(null);

  const currentSampleUrl = samplerTrack.samplerTrack?.sampleUrl;
  const currentSampleName = currentSampleUrl
    ? currentSampleUrl.split("/").pop()
    : "No sample loaded";

  const hasLoadedZone = !!currentSampleUrl;

  // Open library to load a NEW zone
  const openLibraryForNewZone = () => {
    if (!lowNote || !highNote) return;

    navigate({
      to: "/stacks/$stackId/library/$trackId",
      params: { stackId, trackId },
      search: {
        mode: "select-sample",
        lowNote,
        highNote,
        returnTo: "sampler", // ← important flag
      },
    });
  };

  // Edit / replace the current loaded sample
  const editCurrentZone = () => {
    navigate({
      to: "/stacks/$stackId/library/$trackId",
      params: { stackId, trackId },
      search: {
        mode: "select-sample",
        lowNote: "C3", // TODO: make dynamic later if you store zone range
        highNote: "C5",
        returnTo: "sampler", // ← important flag
      },
    });
  };

  const selectNote = (note: string) => {
    if (!lowNote) {
      setLowNote(note);
      return;
    }

    if (!highNote) {
      const lowIndex = NOTE_NAMES.indexOf(
        lowNote as (typeof NOTE_NAMES)[number],
      );
      const noteIndex = NOTE_NAMES.indexOf(note as (typeof NOTE_NAMES)[number]);

      if (noteIndex >= lowIndex) {
        setHighNote(note);
      } else {
        setLowNote(note);
        setHighNote(null);
      }
    } else {
      setLowNote(note);
      setHighNote(null);
    }
  };

  return (
    <>
      {/* Loaded Zones */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="text-xs uppercase tracking-widest text-neutral-500 mb-2 px-1">
          LOADED ZONES
        </div>

        <div className="flex-1 bg-zinc-900 border border-neutral-700 overflow-auto text-sm">
          <div className="divide-y divide-neutral-800">
            {hasLoadedZone ? (
              <button
                onClick={editCurrentZone}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-800 text-left transition-colors"
              >
                <div className="font-mono">C3 — C5</div>
                <div className="text-neutral-400 truncate max-w-[160px]">
                  {currentSampleName}
                </div>
              </button>
            ) : (
              <div className="h-full flex items-center justify-center py-12 text-neutral-500">
                No zones loaded yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom - Select New Zone */}
      <div className="border-t border-neutral-800 bg-zinc-950 p-3">
        <div className="text-xs uppercase tracking-widest text-neutral-500 mb-2">
          SELECT NOTES FOR NEW ZONE
        </div>

        <div className="flex gap-px bg-zinc-900 border border-neutral-700 overflow-x-auto pb-1">
          {NOTE_NAMES.map((note) => {
            const isSelected = lowNote === note || highNote === note;
            return (
              <button
                key={note}
                onClick={() => selectNote(note)}
                className={`flex-shrink-0 w-12 h-10 font-mono text-xs border-r border-neutral-800 last:border-r-0 transition-colors flex items-center justify-center ${
                  isSelected ? "bg-violet-600 text-white" : "hover:bg-zinc-800"
                }`}
              >
                {note}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex gap-2">
          <div className="flex-1 text-sm font-mono border border-neutral-700 bg-zinc-900 px-3 py-2.5">
            {lowNote || "—"} — {highNote || "—"}
          </div>
          <button
            onClick={openLibraryForNewZone}
            disabled={!lowNote || !highNote}
            className="px-6 bg-violet-600 hover:bg-violet-500 disabled:bg-neutral-700 disabled:text-neutral-500 text-sm font-medium"
          >
            Load Sample
          </button>
        </div>
      </div>
    </>
  );
}
