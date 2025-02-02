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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { orderStatus } from "@/lib/enums/order-status";

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (newStatus: (typeof orderStatus)[number]) => void;
  currentStatus: (typeof orderStatus)[number];
  isSubmitting: boolean;
}

const pendingStatusOptions = [
  "pending",
  "confirmed",
  "cancelled",
] as (typeof orderStatus)[number][];

const confirmedStatusOptions = [
  "confirmed",
  "processing",
] as (typeof orderStatus)[number][];

export function UpdateStatusModal({
  isOpen,
  onClose,
  onUpdateStatus,
  currentStatus,
  isSubmitting,
}: UpdateStatusModalProps) {
  const [value, setValue] = useState(currentStatus);

  const mappingSelectItems = () => {
    switch (currentStatus) {
      case "pending":
        return pendingStatusOptions.map((status) => (
          <SelectItem key={status} value={status}>
            {status}
          </SelectItem>
        ));
      case "confirmed":
        return confirmedStatusOptions.map((status) => (
          <SelectItem key={status} value={status}>
            {status}
          </SelectItem>
        ));
      default:
        return <SelectItem value={currentStatus}>{currentStatus}</SelectItem>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Choose a new status for this order.
          </DialogDescription>
        </DialogHeader>
        <Select
          value={currentStatus}
          onValueChange={(newValue) =>
            setValue(newValue as (typeof orderStatus)[number])
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>{mappingSelectItems()}</SelectGroup>
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onUpdateStatus(value)} disabled={isSubmitting}>
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
