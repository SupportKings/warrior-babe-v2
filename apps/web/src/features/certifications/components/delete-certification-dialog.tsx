"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import { deleteCertification } from "@/features/certifications/actions/deleteCertification";
import type { Certification } from "@/features/coaches/queries/certifications.server";

import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteCertificationDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	certification: Certification;
}

export default function DeleteCertificationDialog({
	open,
	onOpenChange,
	certification,
}: DeleteCertificationDialogProps) {
	const [isDeleting, setIsDeleting] = useState(false);
	const queryClient = useQueryClient();

	const handleDelete = async () => {
		setIsDeleting(true);

		const result = await deleteCertification({
			id: certification.id,
		});

		if (result?.data?.success) {
			toast.success("Certification deleted successfully!");

			// Invalidate certification queries to refresh the list
			await queryClient.invalidateQueries({
				queryKey: ["certifications", "all"],
			});

			// Close dialog
			onOpenChange(false);
		} else if (result?.validationErrors?._errors) {
			const errorMessage =
				result.validationErrors._errors[0] ||
				"Failed to delete certification";
			toast.error(errorMessage);
		}

		setIsDeleting(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-[450px]">
				<DialogHeader>
					<DialogTitle>Delete Certification</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete "{certification.name}" by {certification.issuer}?
					</DialogDescription>
				</DialogHeader>

				<div className="rounded-lg bg-destructive/10 p-4">
					<p className="text-sm text-destructive">
						This action cannot be undone. If any users have this certification,
						you will need to deactivate it instead.
					</p>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isDeleting}
					>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={isDeleting}
					>
						{isDeleting && (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						)}
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}