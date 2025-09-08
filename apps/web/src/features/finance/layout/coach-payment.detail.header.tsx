"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useCoachPayment } from "@/features/finance/queries/useCoachPayments";
import { deleteCoachPayment } from "@/features/finance/actions/deleteCoachPayment";
import * as Dialog from "@radix-ui/react-dialog";
import { Trash2Icon, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

interface CoachPaymentDetailHeaderProps {
	coachPaymentId: string;
}

export default function CoachPaymentDetailHeader({
	coachPaymentId,
}: CoachPaymentDetailHeaderProps) {
	const { data: coachPayment } = useCoachPayment(coachPaymentId);
	const router = useRouter();
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	
	const { execute: executeDeleteCoachPayment, isExecuting } = useAction(deleteCoachPayment, {
		onSuccess: () => {
			setIsDeleteDialogOpen(false);
			toast.success(`Coach payment has been deleted successfully`);
			router.push('/dashboard/finance/coach-payments');
		},
		onError: (error) => {
			console.error('Failed to delete coach payment:', error);
			toast.error('Failed to delete coach payment. Please try again.');
		},
	});

	const handleDeleteCoachPayment = () => {
		executeDeleteCoachPayment({ id: coachPaymentId });
	};

	return (
		<div className="sticky top-0 z-10 flex h-[45px] flex-shrink-0 items-center justify-between border-border border-b px-4 py-2 lg:px-6">
			<div className="flex items-center gap-2">
				<SidebarTrigger />
				<BackButton />
				<h1 className="font-medium text-[13px]">
					{coachPayment?.coach_name ? `${coachPayment.coach_name} - Payment Details` : "Coach Payment Details"}
				</h1>
			</div>
			<Dialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<Dialog.Trigger asChild>
					<Button variant="destructive" className="flex items-center gap-2">
						<Trash2Icon className="mr-[6px] h-4 w-4" />
						Delete Payment
					</Button>
				</Dialog.Trigger>
				<Dialog.Portal>
					<Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
					<Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md z-50">
						<Dialog.Title className="text-lg font-semibold mb-4">
							Delete Coach Payment
						</Dialog.Title>
						<Dialog.Description className="text-gray-600 mb-6">
							Are you sure you want to delete this coach payment? This action cannot be undone.
						</Dialog.Description>
						<div className="flex justify-end gap-3">
							<Dialog.Close asChild>
								<Button variant="outline">Cancel</Button>
							</Dialog.Close>
							<Button
								variant="destructive"
								onClick={handleDeleteCoachPayment}
								disabled={isExecuting}
							>
								{isExecuting ? 'Deleting...' : 'Delete'}
							</Button>
						</div>
						<Dialog.Close asChild>
							<Button variant="ghost" size="sm" className="absolute top-3 right-3 p-1">
								<X className="h-4 w-4" />
							</Button>
						</Dialog.Close>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		</div>
	);
}