import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

import TransportControls from "./Controls";
import useStackIdStore from "../stacks/hooks/useStackIdStore";

export function TransportSheet() {
  const [open, setOpen] = useState(false);
  const stackId = useStackIdStore((state) => state.stackId);

  if (!stackId) {
    return null;
  }

  return (
    <>
      {/* Handle - fixed to viewport, matches side handle style */}
      <div
        className={`fixed left-1/2 -translate-x-1/2 z-[60] pointer-events-auto transition-all duration-300 ${
          open ? "bottom-13" : "bottom-0"
        }`}
        onClick={() => setOpen(!open)}
      >
        <div className="h-7 w-28 bg-neutral-800 border border-border rounded-t-xl flex items-center justify-center cursor-pointer hover:bg-neutral-700 transition-colors shadow-md">
          {open ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Sheet - fixed to bottom of viewport, does not scroll with page */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-out pointer-events-none ${
          open ? "translate-y-0" : "translate-y-[calc(100%-28px)]"
        }`}
      >
        <div
          className={`pt-7 overflow-hidden transition-all duration-300 pointer-events-auto ${
            open ? "max-h-20" : "max-h-0"
          }`}
        >
          <div className="bg-background border border-t-0 border-border">
            <div className="mx-auto w-full max-w-4xl">
              <TransportControls />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
