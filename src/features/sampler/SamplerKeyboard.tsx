import { useCallback, useEffect, useRef } from "react";
import type { NoteName } from "@/types";
import { NOTE_NAMES } from "@/types";
import { useNavigate } from "@tanstack/react-router";

type Props = {
  trackId: string;
  stackId: string;
  trigger?: (note: string, duration?: string) => void;
};

export default function SamplerKeyboard({ trackId, stackId, trigger }: Props) {
  const navigate = useNavigate();
  const keyboardRef = useRef<HTMLDivElement>(null);

  const playNote = useCallback(
    (note: NoteName) => {
      trigger?.(note, "8n");
    },
    [trigger],
  );

  const loadSample = () => {
    navigate({
      to: "/stacks/$stackId/library/$trackId",
      params: { stackId, trackId },
      search: {
        mode: "select-sample",
        returnTo: "sampler",
      },
    });
  };

  const isBlackKey = (note: NoteName): boolean =>
    note.includes("#") || note.includes("b");

  // Scroll horizontally to middle of keyboard on mount
  useEffect(() => {
    const keyboard = keyboardRef.current;
    if (!keyboard) return;

    const timeoutId = setTimeout(() => {
      const middlePosition = (keyboard.scrollWidth - keyboard.clientWidth) / 2;
      if (middlePosition > 0) {
        keyboard.scrollLeft = middlePosition;
      }
    }, 50);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="mb-4">
        <div className="text-xs uppercase tracking-widest text-neutral-500 mb-2 px-1">
          KEYBOARD
        </div>
        <div className="bg-zinc-900 border border-neutral-700 overflow-hidden rounded">
          <div
            ref={keyboardRef}
            className="flex h-14 overflow-x-auto overflow-y-hidden"
          >
            {NOTE_NAMES.map((note) => {
              const isBlack = isBlackKey(note);

              return (
                <button
                  key={note}
                  onClick={() => playNote(note)}
                  className={`
                    flex-shrink-0 w-8 h-full border-r border-neutral-800 last:border-r-0
                    flex items-center justify-center text-xs font-mono transition-colors
                    ${
                      isBlack
                        ? "bg-zinc-950 hover:bg-zinc-900 text-white"
                        : "bg-white hover:bg-zinc-100 text-neutral-900"
                    }
                  `}
                >
                  {note}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <button
          onClick={loadSample}
          className="w-full h-10 bg-violet-600 hover:bg-violet-500 text-sm font-medium rounded transition-colors"
        >
          Load Sample
        </button>
      </div>
    </div>
  );
}
