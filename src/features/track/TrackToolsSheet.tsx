import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TrackTools from "./Tools";

export function TrackToolsSheet() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex-shrink-0 relative z-50">
      <div
        className={`absolute top-1/2 -translate-y-1/2 z-[60] pointer-events-auto ${open ? "right-[150px]" : "right-0"}`}
        onClick={() => setOpen(!open)}
      >
        <div className="w-8 h-16 bg-neutral-800 border border-r-0 border-border rounded-l-xl flex items-center justify-center cursor-pointer hover:bg-neutral-700 transition-colors shadow-md">
          {open ? (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>

      <div
        className={`absolute top-0 right-0 w-[150px] h-full bg-neutral-900 flex flex-col border-l border-border overflow-hidden transition-all duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <TrackTools />
      </div>
    </div>
  );
}
