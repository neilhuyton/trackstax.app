import TransportBackward from "@/features/transport/Backward";
import TransportForward from "@/features/transport/Forward";
import TransportLoopDialog from "@/features/transport/LoopDialog";
import TransportPlay from "@/features/transport/Play";
import TransportPositionDialog from "@/features/transport/PositionDialog";
import TransportRecordConfirmDialog from "@/features/transport/RecordConfirmDialog";
import TransportRecordDownloadDialog from "@/features/transport/RecordDownloadDialog";
import TransportReset from "@/features/transport/Reset";
import TransportTempoDialog from "@/features/transport/TempoDialog";
import useStackIdStore from "../stores/useStackIdStore";
import useTransportStore from "../stores/transport";
import useRecord from "./useRecord";

const TransportControls = () => {
  const stackId = useStackIdStore((state) => state.stackId);
  const { isRecord } = useTransportStore();
  const { recording } = useRecord(isRecord);

  if (!stackId) {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row items-center min-w-0 w-full  px-2 py-2">
      {/* Left side - Tempo */}
      <div className="w-full md:w-1/5 flex justify-start flex-shrink-0 mb-4 md:mb-0">
        <TransportTempoDialog />
      </div>

      {/* Center - Main controls */}
      <div className="w-full md:w-3/5 flex flex-wrap justify-center gap-1 lg:gap-1 md:gap-1 sm:gap-1">
        <TransportPlay />
        <TransportReset />
        <TransportBackward />
        <TransportForward />
        <TransportRecordConfirmDialog />
        <TransportLoopDialog />
        <TransportRecordDownloadDialog recording={recording} />
      </div>

      {/* Right side - Position */}
      <div className="w-full md:w-1/5 flex justify-end flex-shrink-0 mt-4 md:mt-0">
        <TransportPositionDialog />
      </div>
    </div>
  );
};

export default TransportControls;
