// src/routes/_authenticated/home.tsx

import { createFileRoute, Link } from "@tanstack/react-router";
import * as Tone from "tone";
import { useRef, useState } from "react";

export const Route = createFileRoute("/_authenticated/home")({
  component: HomePage,
});

function HomePage() {
  const playerRef = useRef<Tone.Player | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );
  const [isPlaying, setIsPlaying] = useState(false);

  const handleClick = async () => {
    // If player already exists, just restart
    if (playerRef.current) {
      const p = playerRef.current;
      if (p.state === "started") {
        p.stop();
      }
      p.start();
      setIsPlaying(true);
      console.log("Restarted from beginning");
      return;
    }

    // First click: load the sample
    setStatus("loading");
    console.log("Starting to load sample...");

    try {
      await Tone.start();

      const player = new Tone.Player({
        url: "/collections/retro-house-and-old-school-rave/drum-breaks-loops/Other-Breaks-01-140bpm.wav",
      }).toDestination();

      playerRef.current = player;

      // Wait for ALL Tone.js buffers to finish loading
      await Tone.loaded();

      console.log("✅ Sample loaded successfully with Tone.loaded()!");
      setStatus("ready");
      setIsPlaying(true);

      player.start(); // Play immediately after load
    } catch (err) {
      console.error("❌ Failed to load sample:", err);
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-4xl mb-12">Home</h1>

      <button
        onClick={handleClick}
        className="w-[100px] h-[100px] bg-orange-500 hover:bg-orange-600 active:bg-orange-700 
                   disabled:bg-zinc-700 rounded-2xl flex items-center justify-center 
                   text-white text-5xl transition-all shadow-lg active:scale-95"
        disabled={status === "loading"}
      >
        {isPlaying ? "■" : "▶"}
      </button>

      <p className="mt-6 text-zinc-400 text-sm">
        {status === "loading" && "Loading sample..."}
        {status === "ready" && "Click to play • Click again to restart"}
        {status === "error" && "Failed to load – check console"}
        {status === "idle" && "Click the button to load & play"}
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
