import { memo } from "react";

import { GridContextMenu } from "@/features/grid/ContextMenu";
import { entryColors } from "@/consts";
import { type Track } from "@/types";
import { getIsActive } from "@/utils/track-utils";

type GridTrackRowProps = {
  track: Track;
  gridLengthInBars: number;
  hasError: boolean;
  onToggle: (bar: number, isActive: boolean) => void;
  onShowMenu: (e: React.MouseEvent, trackId: string, bar: number) => void;
  menu: { x: number; y: number; trackId: string; bar: number } | null;
  onMenuItemClick: (label: string) => void;
  closeMenu: () => void;
};

export const GridTrackRow = memo(
  ({
    track,
    gridLengthInBars,
    hasError,
    onToggle,
    onShowMenu,
    menu,
    onMenuItemClick,
    closeMenu,
  }: GridTrackRowProps) => {
    const color =
      entryColors[track.color as keyof typeof entryColors] ?? "bg-neutral-700";

    return (
      <div className="flex">
        {Array.from({ length: gridLengthInBars }, (_, bar) => {
          const active = getIsActive(bar, track);
          return (
            <button
              key={`${track.id}-${bar}`}
              disabled={hasError}
              onClick={() => onToggle(bar, active)}
              onContextMenu={(e) => onShowMenu(e, track.id, bar)}
              className={`hover:opacity-80 h-[42px] shrink-0 mt-[6px] ml-[6px] rounded-md w-[78px] ${
                active ? color : "bg-neutral-700"
              }`}
              tabIndex={0}
            />
          );
        })}
        <GridContextMenu
          menu={menu}
          closeMenu={closeMenu}
          trackId={track.id}
          onItemClick={onMenuItemClick}
        />
      </div>
    );
  },
);

GridTrackRow.displayName = "GridTrackRow";
