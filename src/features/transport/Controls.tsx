import TransportBackward from "@/features/transport/Backward";
import TransportForward from "@/features/transport/Forward";
import TransportLoopDialog from "@/features/transport/LoopDialog";
import TransportPlay from "@/features/transport/Play";
import TransportRecordConfirmDialog from "@/features/transport/RecordConfirmDialog";
import TransportRecordDownloadDialog from "@/features/transport/RecordDownloadDialog";
import TransportReset from "@/features/transport/Reset";
import useStackIdStore from "../stacks/hooks/useStackIdStore";
import useTransportStore from "./useTransportStore";
import useRecord from "./useRecord";

const TransportControls = () => {
  const stackId = useStackIdStore((state) => state.stackId);
  const { isRecord } = useTransportStore();
  const { recording } = useRecord(isRecord);

  if (!stackId) {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row items-center min-w-0 w-full px-2 py-2">
      <div className="w-full flex flex-wrap justify-center gap-1 lg:gap-1 md:gap-1 sm:gap-1">
        <TransportPlay />
        <TransportReset />
        <TransportBackward />
        <TransportForward />
        <TransportRecordConfirmDialog />
        <TransportLoopDialog />
        <TransportRecordDownloadDialog recording={recording} />
      </div>
    </div>
  );
};

export default TransportControls;
