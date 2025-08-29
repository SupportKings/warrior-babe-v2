"use client";

import type { Database } from "@/utils/supabase/database.types";

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

type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];

interface PaymentDeleteModalProps {
	payment: PaymentRow;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => Promise<void>;
}

export function PaymentDeleteModal({
	payment,
	open,
	onOpenChange,
	onConfirm,
}: PaymentDeleteModalProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete Payment</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete this payment of{" "}
						<strong>${(payment.amount || 0).toLocaleString()}</strong>? This action cannot
						be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={async () => {
							await onConfirm();
						}}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						Delete Payment
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}