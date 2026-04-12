import { TbCircleLetterSFilled } from "react-icons/tb";
import { type Track } from "@/types";
import useTracksStore from "./hooks/useTracksStore";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/trpc";
import { usePlayersStore } from "@/features/transport/hooks/usePlayersStore";

type TrackSoloButtonProps = {
  track: Track;
};

export const TrackSoloButton = ({ track }: TrackSoloButtonProps) => {
  const { storeUpdateTrack } = useTracksStore();
  const { updateTrackSchedule } = usePlayersStore();

  const updateTrackMutation = useMutation(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
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

    updateTrackSchedule(track.id);

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
