import { FaPause, FaPlay, FaStop } from "react-icons/fa6";

interface TransportButtonIconProps {
  isPlay: boolean;
  isLoop: boolean;
}

export const TransportButtonIcon = ({
  isPlay,
  isLoop,
}: TransportButtonIconProps) => {
  let playButton = <FaPlay />;
  if (isPlay && isLoop) {
    playButton = <FaStop />;
  } else if (isPlay) {
    playButton = <FaPause />;
  }
  return playButton;
};
