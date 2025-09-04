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

interface ClientTestimonialDeleteModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	testimonialInfo?: {
		client: string;
		type: string;
	};
}

export function ClientTestimonialDeleteModal({
	open,
	onOpenChange,
	onConfirm,
	testimonialInfo,
}: ClientTestimonialDeleteModalProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete Client Testimonial</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete this client testimonial?
						{testimonialInfo && (
							<>
								<br />
								<br />
								Client: <strong>{testimonialInfo.client}</strong>
								<br />
								Type: <strong>{testimonialInfo.type}</strong>
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
