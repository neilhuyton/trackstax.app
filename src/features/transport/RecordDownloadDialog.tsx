import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useStackIdStore from "../stores/useStackIdStore";
import { useStack } from "../stacks/useStackRead";

type TransportRecordDownloadDialogProps = {
  recording: Blob | null;
};

export const TransportRecordDownloadDialog = ({
  recording,
}: TransportRecordDownloadDialogProps) => {
  const stackId = useStackIdStore((state) => state.stackId);
  const { data, isError } = useStack(stackId);

  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    if (recording) {
      const newUrl = URL.createObjectURL(recording);
      setUrl(newUrl);
      setIsOpen(true);

      return () => {
        URL.revokeObjectURL(newUrl);
      };
    } else {
      setIsOpen(false);
      setUrl("");
    }
  }, [recording]);

  if (isError) return null;

  const filename = `${data?.title || "recording"}.webm`;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={!recording} className="hidden">
          Download Recording
        </Button>
      </DialogTrigger>

      <DialogContent className="focus:outline-none">
        <DialogHeader>
          <DialogTitle>Recording Complete</DialogTitle>
          <DialogDescription>
            Your recording is ready to download.
          </DialogDescription>
        </DialogHeader>

        <div className="text-center space-y-6">
          <a href={url} download={filename}>
            <Button disabled={!url}>Download</Button>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransportRecordDownloadDialog;
