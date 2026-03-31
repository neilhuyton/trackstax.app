import { FaHeart } from "react-icons/fa6";
import { type Track } from "@/types";
import useTracksStore from "./hooks/useTracksStore";

import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/trpc";

type TrackFavouriteButtonProps = {
  track: Track;
};

export const TrackFavouriteButton = ({ track }: TrackFavouriteButtonProps) => {
  const { storeUpdateTrack } = useTracksStore();

  const updateTrackMutation = useMutation(
    trpc.track.update.mutationOptions({
      onError: (error) => {
        console.error("Failed to update favourite state:", error);
      },
    }),
  );

  const handleClick = async () => {
    const newIsFavourite = !track.isFavourite;

    storeUpdateTrack({
      ...track,
      isFavourite: newIsFavourite,
    });

    await updateTrackMutation.mutateAsync({
      id: track.id,
      isFavourite: newIsFavourite,
    });
  };

  return (
    <FaHeart
      size="16"
      onClick={handleClick}
      color={track.isFavourite ? "deeppink" : ""}
      title="Favourite"
      className="hover:cursor-pointer"
    />
  );
};

export default TrackFavouriteButton;
