import { useState } from "react";
import * as Tone from "tone";
import { FaFile, FaSpinner } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { type Stack, type Track } from "@/types";
import { createNewTrack } from "@/utils/track-utils";
import useTracksStore from "../stores/tracks";

import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";

type TrackLibraryDialogProps = {
  userId: string | null;
  tracks: Track[];
  stack: Stack;
};

export const TrackLibraryDialog = ({
  userId,
  tracks,
  stack,
}: TrackLibraryDialogProps) => {
  const { storeAddTrack } = useTracksStore();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loadingFiles, setLoadingFiles] = useState<Record<string, boolean>>({});

  const files: string[] = [
    "http://localhost:3000/bass-132.wav",
    "http://localhost:8888/breaks-132.wav",
    "http://localhost:8888/donk-132.wav",
  ];

  const createTrackMutation = useMutation(
    trpc.track.create.mutationOptions({
      onSuccess: () => {
        setIsOpen(false);
      },
      onError: (error) => {
        console.error("Failed to create track:", error);
      },
    }),
  );

  const handleLoadTrack = async (url: string) => {
    const file = files.find((f) => f === url);
    if (!file) return;

    setLoadingFiles((prev) => ({ ...prev, [url]: true }));

    try {
      const player = new Tone.Player();
      await player.load(url);

      const duration = player.buffer.duration;
      const barDuration = Tone.TransportTime("1m").toSeconds();
      const loopLength = Math.max(1, Math.round(duration / barDuration));
      const filename = url.split("/").pop() || "Untitled";

      const baseTrack = createNewTrack(null, url, tracks, stack);

      const trackId = crypto.randomUUID();

      const newTrack: Track = {
        ...baseTrack,
        id: trackId,
        audioTrack: {
          id: crypto.randomUUID(),
          filename,
          downloadUrl: url,
          loopLength,
          offset: 0,
          duration,
          pitch: 0,
          timestretch: 1,
          fullDuration: duration,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      await createTrackMutation.mutateAsync({
        stackId: stack.id,
        type: "audio",
        label: filename,
        color: newTrack.color,
        downloadUrl: url,
        duration,
        fullDuration: duration,
        loopLength,
        offset: 0,
        pitch: 0,
        timestretch: 1,
      });

      storeAddTrack(newTrack);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to load track:", error);
    } finally {
      setLoadingFiles((prev) => ({ ...prev, [url]: false }));
    }
  };

  if (!userId) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">Open Track Library</Button>
        </DialogTrigger>

        <DialogContent
          className="focus:outline-none sm:max-w-[800px] max-h-[80vh] overflow-y-auto"
          aria-describedby="track-library-description"
        >
          <DialogHeader>
            <DialogTitle>Your Track Library</DialogTitle>
            <DialogDescription>
              A list of your audio tracks, allowing you to select or delete
              them.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            {files?.map((file) => (
              <div
                key={file}
                className="flex items-center justify-between p-2 hover:bg-neutral-900 rounded transition-colors w-full overflow-hidden"
              >
                <div className="flex items-center gap-2 min-w-0 basis-2/3">
                  <FaFile className="text-gray-500 flex-shrink-0" />
                  <span
                    className="text-ellipsis whitespace-nowrap overflow-hidden"
                    title={file}
                  >
                    {file}
                  </span>
                </div>

                <div className="flex gap-2 flex-shrink-0 basis-1/3 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLoadTrack(file)}
                    disabled={loadingFiles[file]}
                  >
                    {loadingFiles[file] && (
                      <FaSpinner
                        data-testid="spinner"
                        className="animate-spin mr-2"
                      />
                    )}
                    Select
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Total tracks: {files?.length || 0}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TrackLibraryDialog;
