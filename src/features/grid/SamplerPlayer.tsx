import { useMemo } from "react";
import useTracksStore from "@/features/track/hooks/useTracksStore";
import SamplerInstance from "./SamplerInstance";

export default function SamplerPlayer() {
  const { tracks } = useTracksStore();

  const samplerTrackIds = useMemo(() => {
    return tracks.filter((t) => t.type === "sampler").map((t) => t.id);
  }, [tracks]);

  return (
    <>
      {samplerTrackIds.map((id) => (
        <SamplerInstance key={id} trackId={id} />
      ))}
    </>
  );
}
