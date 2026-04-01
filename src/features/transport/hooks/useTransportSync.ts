import { type RefObject, useEffect } from "react";

import { PIXELS_PER_BAR } from "@/consts";

import { useTransportRead } from "../useTransportRead";
import useStackIdStore from "../../stacks/hooks/useStackIdStore";
import useTransportStore from "../useTransportStore";

export const useTransportSync = (
  scrollAreaRef: RefObject<HTMLDivElement | null>,
) => {
  const stackId = useStackIdStore((state) => state.stackId);
  const { isReset } = useTransportStore();
  const { transport } = useTransportRead(stackId);

  const { loopStart, isLoop } = transport;

  useEffect(() => {
    if (scrollAreaRef.current && isReset) {
      scrollAreaRef.current.scrollLeft = isLoop
        ? PIXELS_PER_BAR * loopStart
        : 0;
    }
  }, [isReset, isLoop, loopStart, scrollAreaRef]);
};
