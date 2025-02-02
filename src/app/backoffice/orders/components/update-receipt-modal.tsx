"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface UpdateReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateReceipt: (receipt: string) => void;
  currentReceipt: string;
  isSubmitting: boolean;
}

export function UpdateReceiptModal({
  isOpen,
  onClose,
  onUpdateReceipt,
  currentReceipt,
  isSubmitting,
}: UpdateReceiptModalProps) {
  const [value, setValue] = useState(currentReceipt);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Order Receipt</DialogTitle>
          <DialogDescription>Input receipt number</DialogDescription>
        </DialogHeader>
        <Input onChange={(e) => setValue(e.target.value)} />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => onUpdateReceipt(value)}
            disabled={isSubmitting}
          >
            Update Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
