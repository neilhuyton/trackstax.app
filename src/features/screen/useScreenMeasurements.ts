import { useCallback, useEffect, useRef, useState } from "react";
import useScreenStore from "../stores/screen";


const debounce = (func: (...args: unknown[]) => void, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<typeof func>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const useScreenMeasurements = () => {
  const scrollAreaRef = useRef<HTMLElement>(null);
  const trackListRef = useRef<HTMLDivElement>(null);
  const trackToolsRef = useRef<HTMLDivElement>(null);
  const {
    gridWidth,
    isScrollGrid,
    isScrollToPixel,
    trackListWidth,
    trackToolsWidth,
    scrollToPixel,
    playheadPosition,
    isLoopReset,
    setGridWidth,
    setIsScrollGrid,
    setTrackListWidth,
    setTrackToolsWidth,
    setScrollToPixel,
    setIsScrollToPixel,
    setPlayheadPosition,
    setIsLoopReset,
    setScrollLeft,
  } = useScreenStore();

  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [isBackwardsScroll, setIsBackwardsScroll] = useState(false);
  const [lastScrollLeft, setLastScrollLeft] = useState(0);

  const setMeasurements = useCallback(() => {
    const scrollArea = scrollAreaRef.current;
    const trackList = trackListRef.current;
    const trackTools = trackToolsRef.current;

    if (scrollArea && trackList && trackTools) {
      const newGridWidth = scrollArea.getBoundingClientRect().width;
      const newTrackListWidth = trackList.getBoundingClientRect().width;
      const newTrackToolsWidth = trackTools.getBoundingClientRect().width;

      const sanitizedGridWidth = Math.max(newGridWidth, 0);
      const sanitizedTrackListWidth = Math.max(newTrackListWidth, 0);
      const sanitizedTrackToolsWidth = Math.max(newTrackToolsWidth, 0);

      setGridWidth(sanitizedGridWidth);
      setTrackListWidth(sanitizedTrackListWidth);
      setTrackToolsWidth(sanitizedTrackToolsWidth);

      if (sanitizedTrackToolsWidth === 0 || sanitizedTrackListWidth === 0) {
        requestAnimationFrame(setMeasurements);
      }
    }
  }, [setGridWidth, setTrackListWidth, setTrackToolsWidth]);

  useEffect(() => {
    let rafId: number;

    const trySetMeasurements = () => {
      setMeasurements();
      if (
        !scrollAreaRef.current ||
        !trackListRef.current ||
        !trackToolsRef.current
      ) {
        rafId = requestAnimationFrame(trySetMeasurements);
      }
    };

    requestAnimationFrame(() => {
      rafId = requestAnimationFrame(trySetMeasurements);
    });

    const handleResize = () => setMeasurements();
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, [setMeasurements]);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const handleScroll = () => {
      if (!scrollAreaRef.current) return;

      const currentScrollLeft = scrollAreaRef.current.scrollLeft;

      if (currentScrollLeft < lastScrollLeft) {
        setIsBackwardsScroll(true);
      } else if (currentScrollLeft > lastScrollLeft) {
        setIsBackwardsScroll(false);
      }

      setLastScrollLeft(currentScrollLeft);
      setIsUserScrolling(true);
    };

    const handleScrollEnd = debounce(() => {
      setIsUserScrolling(false);
    }, 200);

    scrollArea.addEventListener("scroll", handleScroll);
    scrollArea.addEventListener("scroll", handleScrollEnd);

    return () => {
      scrollArea.removeEventListener("scroll", handleScroll);
      scrollArea.removeEventListener("scroll", handleScrollEnd);
    };
  }, [lastScrollLeft]);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (isScrollToPixel && scrollArea && scrollToPixel !== undefined) {
      scrollArea.scrollTo({
        left: scrollToPixel,
        behavior: "smooth",
      });

      setScrollToPixel(scrollToPixel);
      setIsScrollToPixel(false);
    }
  }, [scrollToPixel, isScrollToPixel, setScrollToPixel, setIsScrollToPixel]);

  useEffect(() => {
    if (
      isScrollGrid &&
      scrollAreaRef.current &&
      playheadPosition !== undefined &&
      !isUserScrolling &&
      !isBackwardsScroll
    ) {
      const targetLeftPosition = trackListWidth;
      const newScrollPosition = Math.max(
        0,
        playheadPosition - targetLeftPosition
      );

      if (newScrollPosition > scrollAreaRef.current.scrollLeft || isLoopReset) {
        scrollAreaRef.current.scrollLeft = newScrollPosition;
      }

      setIsScrollGrid(false);
      setPlayheadPosition(newScrollPosition);
      setIsLoopReset(false);
    }
  }, [gridWidth, isScrollGrid, trackListWidth, trackToolsWidth, playheadPosition, isUserScrolling, isBackwardsScroll, isLoopReset, setIsScrollGrid, setPlayheadPosition, setIsLoopReset]);

  const handleScroll = useCallback(() => {
    if (scrollAreaRef.current) {
      setScrollLeft(scrollAreaRef.current.scrollLeft);
    }
  }, [setScrollLeft]);

  return {
    scrollAreaRef,
    trackListRef,
    trackToolsRef,
    handleScroll,
    setMeasurements,
    isBackwardsScroll,
  };
};
