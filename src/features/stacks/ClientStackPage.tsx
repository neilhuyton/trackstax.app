import { useEffect, useRef } from "react";
import useStackIdStore from "./hooks/useStackIdStore";
import useTracksStore from "../track/hooks/useTracksStore";
import { useTrackRead } from "../track/hooks/useTrackRead";
import { toClientTracks } from "../utils/track-utils";

interface ClientStackPageProps {
  stackId: string;
}

const ClientStackPage = ({ stackId }: ClientStackPageProps) => {
  const setStackId = useStackIdStore((state) => state.setStackId);
  const { tracks: serverTracks } = useTrackRead(stackId);
  const { setTracks } = useTracksStore();
  const hasSynced = useRef(false);

  useEffect(() => {
    setStackId(stackId);

    if (!hasSynced.current && serverTracks && serverTracks.length > 0) {
      const typedTracks = toClientTracks(serverTracks);
      setTracks(typedTracks);
      hasSynced.current = true;
    }
  }, [stackId, setStackId, setTracks, serverTracks]);

  return null;
};

export default ClientStackPage;
