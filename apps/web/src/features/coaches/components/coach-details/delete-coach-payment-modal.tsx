"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { deleteCoachPayment } from "@/features/coaches/actions/coach-payments";

interface DeleteCoachPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentId: string;
  coachId: string;
}

/**
 * Confirmation modal that deletes a coach payment.
 *
 * Renders an AlertDialog which, when confirmed, calls `deleteCoachPayment(paymentId, coachId)`.
 * On success it shows a success toast, closes the modal via `onOpenChange(false)`, and refreshes
 * the Next.js router; on failure it shows an error toast. While the deletion is in progress the
 * dialog actions are disabled and the primary action shows a loading label.
 *
 * @param open - Whether the modal is visible.
 * @param onOpenChange - Callback invoked to change the modal open state.
 * @param paymentId - ID of the payment to delete.
 * @param coachId - ID of the coach associated with the payment.
 */
export function DeleteCoachPaymentModal({
  open,
  onOpenChange,
  paymentId,
  coachId,
}: DeleteCoachPaymentModalProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteCoachPayment(paymentId, coachId);
      
      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast.error("An unexpected error occurred while deleting the payment");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Payment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this payment? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}