"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

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

import { toast } from "sonner";

interface DeleteCoachPaymentModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	paymentId: string;
	coachId: string;
}

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
						Are you sure you want to delete this payment? This action cannot be
						undone.
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
