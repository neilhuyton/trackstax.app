import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import useTracksStore from "@/features/track/hooks/useTracksStore";
import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";
import type { Track, SamplerZone, NoteName } from "@/types";
import { NOTE_NAMES } from "@/types";
import { useNavigate } from "@tanstack/react-router";

type Props = {
  trackId: string;
  isCreatingZone: boolean;
  setIsCreatingZone: (value: boolean) => void;
  selectedNotes: string[];
  clearZoneSelection: () => void;
};

export default function SamplerZones({
  trackId,
  isCreatingZone,
  setIsCreatingZone,
  selectedNotes,
  clearZoneSelection,
}: Props) {
  const { tracks, storeUpdateTrack } = useTracksStore();
  const track = tracks.find((t) => t.id === trackId);
  const samplerTrackData = track?.samplerTrack;

  const [zones, setZones] = useState<SamplerZone[]>(
    samplerTrackData?.zones ?? [],
  );

  const [pendingZone, setPendingZone] = useState<{
    sampleUrl: string;
    lowNote: NoteName;
    highNote: NoteName;
  } | null>(null);

  const [selectedRootNote, setSelectedRootNote] = useState<NoteName>("C4");

  const navigate = useNavigate();

  const updateZonesMutation = useMutation(
    trpc.sampler.updateSample.mutationOptions(),
  );

  // Sync zones from store
  useEffect(() => {
    if (samplerTrackData?.zones) {
      setZones(samplerTrackData.zones);
    }
  }, [samplerTrackData?.zones]);

  // Handle return from Library for sampler-zone
  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);

    const returnTo = urlSearchParams.get("returnTo");
    const sampleUrl = urlSearchParams.get("sampleUrl");
    const lowNoteParam = urlSearchParams.get("lowNote") as NoteName | null;
    const highNoteParam = urlSearchParams.get("highNote") as NoteName | null;

    if (
      returnTo === "sampler-zone" &&
      sampleUrl &&
      lowNoteParam &&
      highNoteParam
    ) {
      setPendingZone({
        sampleUrl,
        lowNote: lowNoteParam,
        highNote: highNoteParam,
      });
      setSelectedRootNote("C4");

      // Clean URL
      navigate({
        to: "/stacks/$stackId/sampler/$trackId",
        params: { stackId: track?.stackId || "", trackId },
        search: {
          page: 0,
          returnTo: undefined,
          sampleUrl: undefined,
          filename: undefined,
          lowNote: undefined,
          highNote: undefined,
        },
        replace: true,
      });
    }
  }, [navigate, track?.stackId, trackId]);

  const confirmNewZone = useCallback(async () => {
    if (!pendingZone || !track || !samplerTrackData) return;

    const newZone: SamplerZone = {
      id: crypto.randomUUID(),
      sampleUrl: pendingZone.sampleUrl,
      lowNote: pendingZone.lowNote,
      highNote: pendingZone.highNote,
      rootNote: selectedRootNote,
    };

    const updatedZones = [...zones, newZone];

    const updatedTrack: Track = {
      ...track,
      samplerTrack: {
        ...samplerTrackData,
        zones: updatedZones,
      },
    };

    storeUpdateTrack(updatedTrack);

    try {
      await updateZonesMutation.mutateAsync({
        trackId,
        zones: updatedZones,
      });
    } catch (error) {
      console.error("Failed to save zone:", error);
    }

    setPendingZone(null);
    setSelectedRootNote("C4");
  }, [
    pendingZone,
    selectedRootNote,
    track,
    samplerTrackData,
    zones,
    storeUpdateTrack,
    updateZonesMutation,
    trackId,
  ]);

  const cancelNewZone = useCallback(() => {
    setPendingZone(null);
    setSelectedRootNote("C4");
  }, []);

  const deleteZone = useCallback(
    (zoneId: string) => {
      const updatedZones = zones.filter((z) => z.id !== zoneId);

      if (track && samplerTrackData) {
        const updatedTrack: Track = {
          ...track,
          samplerTrack: {
            ...samplerTrackData,
            zones: updatedZones,
          },
        };
        storeUpdateTrack(updatedTrack);
      }

      updateZonesMutation.mutate({ trackId, zones: updatedZones });
    },
    [
      zones,
      track,
      samplerTrackData,
      storeUpdateTrack,
      updateZonesMutation,
      trackId,
    ],
  );

  const handleAssignSample = useCallback(() => {
    if (selectedNotes.length < 2 || !track) return;

    const sortedIndices = selectedNotes
      .map((n) => NOTE_NAMES.indexOf(n as NoteName))
      .sort((a, b) => a - b);

    const lowNote = NOTE_NAMES[sortedIndices[0]] as NoteName;
    const highNote = NOTE_NAMES[
      sortedIndices[sortedIndices.length - 1]
    ] as NoteName;

    navigate({
      to: "/stacks/$stackId/library/$trackId",
      params: { stackId: track.stackId, trackId },
      search: {
        page: 0,
        returnTo: "sampler-zone",
        lowNote,
        highNote,
        sampleUrl: undefined,
        filename: undefined,
      },
    });

    clearZoneSelection();
    setIsCreatingZone(false);
  }, [
    selectedNotes,
    track,
    navigate,
    clearZoneSelection,
    setIsCreatingZone,
    trackId,
  ]);

  // Pending zone UI (root note selector)
  if (pendingZone) {
    return (
      <div className="bg-zinc-900 border border-neutral-700 rounded p-4">
        <div className="text-sm font-medium mb-3">
          Choose root note for new zone
        </div>
        <div className="text-xs text-neutral-400 mb-4">
          Sample: {pendingZone.sampleUrl.split("/").pop()}
          <br />
          Range: {pendingZone.lowNote} — {pendingZone.highNote}
        </div>

        <select
          value={selectedRootNote}
          onChange={(e) => setSelectedRootNote(e.target.value as NoteName)}
          className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm mb-4"
        >
          {NOTE_NAMES.map((note) => (
            <option key={note} value={note}>
              {note}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <Button size="sm" onClick={confirmNewZone}>
            Save Zone
          </Button>
          <Button variant="ghost" size="sm" onClick={cancelNewZone}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Normal UI
  return (
    <div className="bg-zinc-900 border border-neutral-700 rounded p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium">Sample Zones</div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCreatingZone(!isCreatingZone)}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Create Zone
        </Button>
      </div>

      {isCreatingZone && (
        <div className="mb-4 p-3 bg-neutral-800 rounded">
          <div className="text-xs text-neutral-400 mb-3">
            Select a range on the keyboard below, then click "Assign Sample to
            Range"
          </div>
          <Button
            size="sm"
            onClick={handleAssignSample}
            disabled={selectedNotes.length < 2}
          >
            Assign Sample to Range
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearZoneSelection}
            className="ml-2"
          >
            Cancel
          </Button>
        </div>
      )}

      {zones.length > 0 && (
        <div className="space-y-2 mb-4">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="flex items-center justify-between bg-neutral-800 rounded px-3 py-2 text-sm"
            >
              <div className="font-mono">
                {zone.lowNote} — {zone.highNote} (root: {zone.rootNote})
              </div>
              <div className="flex items-center gap-3">
                <div className="text-neutral-400 text-xs truncate max-w-[200px]">
                  {zone.sampleUrl.split("/").pop()}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-red-400 hover:text-red-500"
                  onClick={() => deleteZone(zone.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {zones.length === 0 && !isCreatingZone && (
        <div className="text-neutral-500 text-sm py-2">
          No zones created yet. Click "Create Zone", select notes on the
          keyboard, then assign a sample.
        </div>
      )}
    </div>
  );
}
