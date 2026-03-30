import { useState } from "react";
import { FaHeartCrack } from "react-icons/fa6";

import useTracksStore from "../stores/tracks";
import { ConfirmDialog } from "../track/ConfirmDialog";   // ← using the merged ConfirmDialog

export const DestinationTools = () => {
  const { tracks, isError, storeDeleteTracks, setTracks } = useTracksStore();

  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  const favouriteTracks = tracks.filter((track) => track.isFavourite);
  const nonFavouriteTracks = tracks.filter((track) => !track.isFavourite);
  const nonFavouriteCount = nonFavouriteTracks.length;

  const handleFavouriteClick = () => {
    if (!nonFavouriteCount) return;
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (nonFavouriteTracks.length === 0) return;

    storeDeleteTracks(nonFavouriteTracks);

    // Update remaining tracks (remove favourite flag)
    const updatedTracks = favouriteTracks.map((t) => ({
      ...t,
      isFavourite: false,
    }));
    setTracks(updatedTracks);

    // TODO: Add actual delete mutation when ready
    // await deleteTracks(nonFavouriteTracks);
    // await updateTracks(updatedTracks);

    setIsConfirmOpen(false);
  };

  if (isError) return null;

  return (
    <>
      <div className="w-full h-full flex items-center justify-between rounded-md gap-4 px-4 border-2 border-neutral-900">
        <div>
          <FaHeartCrack
            title="Remove non-favourite tracks"
            onClick={handleFavouriteClick}
            className="hover:cursor-pointer"
            size={20}
          />
        </div>
        <div>{/* <DestinationVolumeDialog /> */}</div>
        <div>{/* Mute button placeholder */}</div>
        <div className="w-[20px]"></div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Confirm Remove"
        message={`Are you sure you want to remove ${nonFavouriteCount} tracks from this stack?`}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default DestinationTools;