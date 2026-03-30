import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import TrackList from "./List";

export function TrackListSheet() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex-shrink-0 relative z-50">
      <div
        className={`absolute top-1/2 -translate-y-1/2 z-[60] pointer-events-auto ${open ? "left-[200px]" : "left-0"}`}
        onClick={() => setOpen(!open)}
      >
        <div className="w-8 h-16 bg-neutral-800 border border-l-0 border-border rounded-r-xl flex items-center justify-center cursor-pointer hover:bg-neutral-700 transition-colors shadow-md">
          {open ? (
            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>

      <div
        className={`absolute top-0 left-0 w-[200px] h-full bg-neutral-900 flex flex-col border-r border-border overflow-hidden transition-all duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <TrackList />
      </div>
    </div>
  );
}
