// src/routes/_authenticated/home.tsx

import { createFileRoute, Link } from "@tanstack/react-router";
import * as Tone from "tone";
import { useRef, useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/home")({
  component: HomePage,
});

function HomePage() {
  const playerRef = useRef<Tone.Player | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Pre-load the sample + reduce latency on mount
  useEffect(() => {
    const init = async () => {
      // Reduce scheduling latency (very important for instant response)
      Tone.getContext().lookAhead = 0;

      await Tone.start();

      const player = new Tone.Player({
        url: "/collections/retro-house-and-old-school-rave/drum-breaks-loops/Other-Breaks-01-140bpm.wav",
        onload: () => {
          console.log("✅ Sample pre-loaded (low latency mode)");
          setIsReady(true);
        },
        onerror: (err) => console.error("Load error:", err),
      }).toDestination();

      playerRef.current = player;
    };

    init();

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, []);

  const handleClick = () => {
    const player = playerRef.current;
    if (!player || !isReady) return;

    const now = Tone.now();

    if (player.state === "started") {
      player.stop(now);
      player.start(now); // instant restart from beginning
      console.log("Restarted instantly");
    } else {
      player.start(now);
      console.log("Started playing");
    }

    setIsPlaying(player.state === "started");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-4xl mb-12">Home</h1>

      <button
        onClick={handleClick}
        disabled={!isReady}
        className="w-[100px] h-[100px] bg-orange-500 hover:bg-orange-600 active:bg-orange-700 
                   disabled:bg-zinc-700 disabled:cursor-not-allowed
                   rounded-2xl flex items-center justify-center text-white text-5xl 
                   transition-all shadow-lg active:scale-95 focus:outline-none"
      >
        {isPlaying ? "■" : "▶"}
      </button>

      <p className="mt-6 text-zinc-400 text-sm">
        {!isReady
          ? "Pre-loading sample..."
          : "Click to play • Click again to restart instantly"}
      </p>

      <div className="mt-12">
        <Link
          to="/stacks"
          className="text-blue-400 hover:text-blue-300 underline"
        >
          Link to Stacks →
        </Link>
      </div>
    </div>
  );
}
