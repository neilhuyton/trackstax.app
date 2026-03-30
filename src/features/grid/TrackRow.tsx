import { entryColors } from "@/consts";
import { type Track } from "@/types";
import { getIsActive } from "@/utils/track-utils";

type GridTrackRowProps = {
  track: Track;
  gridLengthInBars: number;
  hasError: boolean;
  onToggle: (bar: number, isActive: boolean) => void;
  onShowMenu: (e: React.MouseEvent, trackId: string, bar: number) => void;
};

export const GridTrackRow = ({
  track,
  gridLengthInBars,
  hasError,
  onToggle,
  onShowMenu,
}: GridTrackRowProps) => {
  const color =
    entryColors[track.color as keyof typeof entryColors] ?? "bg-neutral-700";

  return (
    <div className="grid grid-cols-8 gap-1.5 bg-[#2a2a2a] rounded-lg overflow-hidden">
      {Array.from({ length: gridLengthInBars }, (_, bar) => {
        const active = getIsActive(bar, track);

        return (
          <button
            key={`${track.id}-${bar}`}
            disabled={hasError}
            onClick={(e) => {
              e.stopPropagation();
              console.log(
                `Clicked:: Track ${track.id}, Bar ${bar}, wasActive: ${active}`,
              );
              onToggle(bar, active);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onShowMenu(e, track.id, bar);
            }}
            className={`flex items-center justify-center text-white text-sm rounded-md 
                hover:opacity-80 h-full transition-colors
                ${active ? color : "bg-neutral-700"}
                ${hasError ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            tabIndex={0}
            type="button"
          />
        );
      })}
    </div>
  );
};

GridTrackRow.displayName = "GridTrackRow";

export default GridTrackRow;
