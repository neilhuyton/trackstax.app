import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

import TransportControls from "./Controls";
import useStackIdStore from "../stacks/useStackIdStore";

export function TransportSheet() {
  const [open, setOpen] = useState(false);
  const stackId = useStackIdStore((state) => state.stackId);

  if (!stackId) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-out pointer-events-none ${
        open ? "translate-y-0" : "translate-y-[calc(100%-28px)]"
      }`}
    >
      <div
        className="absolute left-1/2 -translate-x-1/2 z-10 pointer-events-auto"
        onClick={() => setOpen(!open)}
      >
        <div className="h-7 bg-background border-x border-t border-border shadow-sm rounded-t-xl flex items-center justify-center px-4 cursor-pointer">
          <div className="flex items-center gap-1">
            {open ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
            <span className="text-[10px] font-medium text-muted-foreground tracking-widest">
              TRANSPORT
            </span>
          </div>
        </div>
      </div>

      <div
        className={`pt-7 overflow-hidden transition-all duration-300 pointer-events-auto ${open ? "max-h-[60vh]" : "max-h-0"}`}
      >
        <div className="bg-background border border-t-0 border-border">
          <div className="mx-auto w-full max-w-4xl">
            <TransportControls />
          </div>
        </div>
      </div>
    </div>
  );
}
