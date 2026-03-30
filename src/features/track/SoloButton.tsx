import { TbCircleLetterSFilled } from "react-icons/tb";
import { type Track } from "@/types";
import useTracksStore from "../stores/tracks";

import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/trpc";

type TrackSoloButtonProps = {
  track: Track;
};

export const TrackSoloButton = ({ track }: TrackSoloButtonProps) => {
  const { storeUpdateTrack } = useTracksStore();

  const updateTrackMutation = useMutation(
    trpc.track.update.mutationOptions({
      onError: (error) => {
        console.error("Failed to update solo state:", error);
      },
    }),
  );

  const handleClick = async () => {
    const newIsSolo = !track.isSolo;

    storeUpdateTrack({
      ...track,
      isSolo: newIsSolo,
    });

    await updateTrackMutation.mutateAsync({
      id: track.id,
      isSolo: newIsSolo,
    });
  };

  return (
    <TbCircleLetterSFilled
      size="20"
      onClick={handleClick}
      color={track.isSolo ? "green" : ""}
      title="Solo"
      className="hover:cursor-pointer"
    />
  );
};

export default TrackSoloButton;
