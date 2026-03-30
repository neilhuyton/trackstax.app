import { useCallback, useEffect, useState } from "react";

type ContextMenuState = {
  x: number;
  y: number;
  trackId: string;
  bar: number;
} | null;

export const useContextMenu = (scrollAreaRef: React.RefObject<HTMLElement>) => {
  const [menu, setMenu] = useState<ContextMenuState>(null);

  const showMenu = useCallback(
    (e: React.MouseEvent, trackId: string, bar: number) => {
      e.preventDefault();

      // Get scroll offsets from scrollAreaRef if available, otherwise use window
      const scrollContainer = scrollAreaRef.current;
      const scrollX = scrollContainer
        ? scrollContainer.scrollLeft
        : window.scrollX;
      const scrollY = scrollContainer
        ? scrollContainer.scrollTop
        : window.scrollY;

      // Base position from mouse click, adjusted for scroll
      const x = e.clientX + scrollX - 168;
      const y = e.clientY + scrollY - 250;

      // Adjust for menu size and container boundaries
      const menuWidth = 120;
      const menuHeight = 80;
      const maxX =
        (scrollContainer ? scrollContainer.clientWidth : window.innerWidth) -
        menuWidth +
        scrollX;
      const maxY =
        (scrollContainer ? scrollContainer.clientHeight : window.innerHeight) -
        menuHeight +
        scrollY;

      const finalX = Math.min(x, maxX);
      const finalY = Math.min(y, maxY);

      setMenu({
        x: finalX,
        y: finalY,
        trackId,
        bar,
      });
    },
    [scrollAreaRef],
  );

  const closeMenu = useCallback(() => setMenu(null), []);

  useEffect(() => {
    if (menu) {
      const handleClickOutside = () => setMenu(null);
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [menu]);

  return { menu, showMenu, closeMenu };
};
