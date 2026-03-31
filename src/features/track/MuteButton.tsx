import { TbCircleLetterMFilled } from "react-icons/tb";
import { type Track } from "@/types";
import useTracksStore from "./hooks/useTracksStore";

import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/trpc";

type TrackMuteButtonProps = {
  track: Track;
};

export const TrackMuteButton = ({ track }: TrackMuteButtonProps) => {
  const { storeUpdateTrack } = useTracksStore();

  const updateTrackMutation = useMutation(
    trpc.track.update.mutationOptions({
      onError: (error) => {
        console.error("Failed to update mute state:", error);
      },
    }),
  );

  const handleClick = async () => {
    const newIsMute = !track.isMute;

    storeUpdateTrack({
      ...track,
      isMute: newIsMute,
    });

    await updateTrackMutation.mutateAsync({
      id: track.id,
      isMute: newIsMute,
    });
  };

  return (
    <TbCircleLetterMFilled
      size="20"
      onClick={handleClick}
      color={track.isMute ? "red" : ""}
      title="Mute"
      className="hover:cursor-pointer"
    />
  );
};

export default TrackMuteButton;
