import { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";

export default function OrientationLock() {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const currentlyPortrait = window.matchMedia(
        "(orientation: portrait)",
      ).matches;
      setIsPortrait(currentlyPortrait);

      // Try to force landscape
      if (
        screen.orientation?.lock &&
        typeof screen.orientation.lock === "function"
      ) {
        if (currentlyPortrait) {
          screen.orientation.lock("landscape").catch((err) => {
            console.warn("Could not lock screen orientation:", err);
          });
        }
      }
    };

    // Initial check
    checkOrientation();

    // Listen for changes
    const mediaQuery = window.matchMedia("(orientation: portrait)");
    mediaQuery.addEventListener("change", checkOrientation);

    window.addEventListener("resize", checkOrientation);

    return () => {
      mediaQuery.removeEventListener("change", checkOrientation);
      window.removeEventListener("resize", checkOrientation);

      // Safely unlock when component unmounts
      if (
        screen.orientation?.unlock &&
        typeof screen.orientation.unlock === "function"
      ) {
        try {
          screen.orientation.unlock();
        } catch (err) {
          // Some browsers throw synchronously or return void
          console.warn("Could not unlock orientation:", err);
        }
      }
    };
  }, []);

  if (!isPortrait) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-zinc-950 flex flex-col items-center justify-center text-center p-8">
      <RotateCw className="w-16 h-16 text-violet-400 mb-6 animate-spin-slow" />

      <h2 className="text-2xl font-semibold text-white mb-3">
        Rotate your device
      </h2>
      <p className="text-neutral-400 max-w-xs">
        This app works best in landscape mode.
        <br />
        Please rotate your phone or tablet.
      </p>

      <p className="text-xs text-neutral-500 mt-8">
        Tip: Make sure rotation lock is disabled in your device settings.
      </p>
    </div>
  );
}
