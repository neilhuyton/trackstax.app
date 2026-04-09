import { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";

export default function OrientationLock() {
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkOrientationAndDevice = () => {
      const currentlyPortrait = window.matchMedia(
        "(orientation: portrait)",
      ).matches;
      const currentlyMobile = window.matchMedia("(max-width: 768px)").matches;

      setIsPortrait(currentlyPortrait);
      setIsMobile(currentlyMobile);
    };

    checkOrientationAndDevice();

    const orientationMedia = window.matchMedia("(orientation: portrait)");
    const mobileMedia = window.matchMedia("(max-width: 768px)");

    orientationMedia.addEventListener("change", checkOrientationAndDevice);
    mobileMedia.addEventListener("change", checkOrientationAndDevice);

    window.addEventListener("resize", checkOrientationAndDevice);

    return () => {
      orientationMedia.removeEventListener("change", checkOrientationAndDevice);
      mobileMedia.removeEventListener("change", checkOrientationAndDevice);
      window.removeEventListener("resize", checkOrientationAndDevice);
    };
  }, []);

  if (!isPortrait || !isMobile) return null;

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
