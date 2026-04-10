import { entryColors } from "@/consts";
import { type Track } from "@/types";
import { getIsActive } from "@/features/utils/track-utils";
import { memo } from "react";

type GridTrackRowProps = {
  track: Track;
  visibleStartBar: number;
  visibleBarCount: number;
  hasError: boolean;
  onToggle: (globalBar: number, isActive: boolean) => void;
  onShowMenu: (e: React.MouseEvent, trackId: string, globalBar: number) => void;
};

const GridTrackRow = ({
  track,
  visibleStartBar,
  visibleBarCount,
  hasError,
  onToggle,
  onShowMenu,
}: GridTrackRowProps) => {
  const color =
    entryColors[track.color as keyof typeof entryColors] ?? "bg-neutral-700";

  return (
    <div className="h-full grid grid-cols-8 gap-1.5 bg-[#2a2a2a] rounded-lg overflow-hidden">
      {Array.from({ length: visibleBarCount }, (_, i) => {
        const globalBar = visibleStartBar + i;
        const active = getIsActive(globalBar, track);

        return (
          <button
            key={`${track.id}-${globalBar}`}
            disabled={hasError}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(globalBar, active);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onShowMenu(e, track.id, globalBar);
            }}
            className={`h-full w-full flex items-center justify-center text-white text-sm rounded-md hover:opacity-80 transition-colors
              ${active ? color : "bg-neutral-700"}
              ${hasError ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            tabIndex={0}
            type="button"
          />
        );
      })}
    </div>
  );
};

export default memo(GridTrackRow);
