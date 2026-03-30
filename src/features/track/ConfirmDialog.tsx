import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type ConfirmDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void | Promise<void>;
};

export const ConfirmDialog = ({
  isOpen,
  onOpenChange,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
}: ConfirmDialogProps) => {
  const handleConfirm = async () => {
    try {
      if (onConfirm) {
        await onConfirm();
      }
    } catch (error) {
      console.error(`${title} error:`, error);
    } finally {
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="focus:outline-none">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription>Please confirm</DialogDescription>
        <div className="py-4">{message}</div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {cancelLabel}
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
