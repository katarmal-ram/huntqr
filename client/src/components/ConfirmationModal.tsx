import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  codeString: string;
}

export function ConfirmationModal({
  open,
  onConfirm,
  onCancel,
  codeString,
}: ConfirmationModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-md border-destructive border-2" data-testid="modal-confirmation">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <DialogTitle className="text-2xl">Risk Warning</DialogTitle>
          </div>
          <DialogDescription className="text-base space-y-4 pt-4">
            <p>
              You're about to scan code:{" "}
              <span className="font-mono font-bold text-foreground text-lg">
                {codeString}
              </span>
            </p>
            <p className="text-destructive font-semibold">
              ⚠️ This code may give positive or negative points (-10 to +30).
            </p>
            <p>Once scanned, it cannot be used again in this session.</p>
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-destructive hover:bg-destructive text-destructive-foreground"
            data-testid="button-take-risk"
          >
            Take Risk
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
