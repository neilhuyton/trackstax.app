import { useState, useEffect, useCallback } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

export default function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen toggle failed:", err);
      // Fallback
      setIsFullscreen((prev) => !prev);
    }
  }, []);

  // Sync with browser fullscreen state
  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  return (
    <button
      onClick={toggleFullscreen}
      className="fixed bottom-4 right-4 z-[200] bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 
                 text-white p-3 rounded-2xl border border-zinc-700 shadow-lg
                 transition-all hover:scale-105 active:scale-95"
      title={isFullscreen ? "Exit Full Screen" : "Enter Full Screen"}
    >
      {isFullscreen ? (
        <Minimize2 className="w-5 h-5" />
      ) : (
        <Maximize2 className="w-5 h-5" />
      )}
    </button>
  );
}
