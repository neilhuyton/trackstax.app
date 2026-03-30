type GridContextMenuProps = {
  menu: { x: number; y: number; trackId: string; bar: number } | null;
  closeMenu: () => void;
  trackId: string;
  onItemClick: (label: string) => void;
};

export const GridContextMenu = ({
  menu,
  trackId,
  onItemClick,
}: GridContextMenuProps) => {
  if (!menu || menu.trackId !== trackId) return null;

  return (
    <div
      role="menu"
      className="absolute w-[150px] h-72 bg-neutral-800 border border-black z-[1000]"
      style={{ left: `${menu.x}px`, top: `${menu.y}px` }}
    >
      <button
        type="button"
        role="menuitem"
        onClick={() => onItemClick("Add 4 bars")}
        className="block w-full text-left px-2 hover:bg-neutral-600 text-white h-12"
      >
        Add 4 bars
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={() => onItemClick("Add 8 bars")}
        className="block w-full text-left px-2 hover:bg-neutral-600 text-white h-12"
      >
        Add 8 bars
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={() => onItemClick("Remove 4 bars")}
        className="block w-full text-left px-2 hover:bg-neutral-600 text-white h-12"
      >
        Remove 4 bars
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={() => onItemClick("Remove 8 bars")}
        className="block w-full text-left px-2 hover:bg-neutral-600 text-white h-12"
      >
        Remove 8 bars
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={() => onItemClick("Add 8 bar gap")}
        className="block w-full text-left px-2 hover:bg-neutral-600 text-white h-12"
      >
        Add 8 bar gap
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={() => onItemClick("Remove 8 bar gap")}
        className="block w-full text-left px-2 hover:bg-neutral-600 text-white h-12"
      >
        Remove 8 bar gap
      </button>
    </div>
  );
};
