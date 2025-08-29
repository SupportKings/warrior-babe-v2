"use client";

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

interface CoachPaymentDeleteModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	paymentInfo?: {
		coach: string;
		periods: number;
	};
}

export function CoachPaymentDeleteModal({
	open,
	onOpenChange,
	onConfirm,
	paymentInfo,
}: CoachPaymentDeleteModalProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete Coach Payment</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete this coach payment?
						{paymentInfo && (
							<>
								<br />
								<br />
								Coach: <strong>{paymentInfo.coach}</strong>
								<br />
								Activity Periods: <strong>{paymentInfo.periods}</strong>
							</>
						)}
						<br />
						<br />
						This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}