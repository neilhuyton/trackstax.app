import { useEffect, useRef } from "react";
import useStackIdStore from "./hooks/useStackIdStore";
import useTracksStore from "../track/hooks/useTracksStore";
import { useTrackRead } from "../track/hooks/useTrackRead";

interface ClientStackPageProps {
  stackId: string;
}

const ClientStackPage = ({ stackId }: ClientStackPageProps) => {
  const setStackId = useStackIdStore((state) => state.setStackId);
  const { tracks } = useTrackRead(stackId);
  const { setTracks } = useTracksStore();
  const hasSynced = useRef(false);

  useEffect(() => {
    setStackId(stackId);
    if (!hasSynced.current && tracks && tracks.length > 0) {
      setTracks(tracks);
    }
  }, [stackId, setStackId, setTracks, tracks]);

  return null;
};

export default ClientStackPage;
