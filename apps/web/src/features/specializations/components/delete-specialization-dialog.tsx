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

import { deleteSpecialization } from "@/features/specializations/actions/deleteSpecialization";
import type { Specialization } from "@/features/coaches/queries/specializations.server";

import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteSpecializationDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	specialization: Specialization;
}

export default function DeleteSpecializationDialog({
	open,
	onOpenChange,
	specialization,
}: DeleteSpecializationDialogProps) {
	const [isDeleting, setIsDeleting] = useState(false);
	const queryClient = useQueryClient();

	const handleDelete = async () => {
		setIsDeleting(true);

		const result = await deleteSpecialization({
			id: specialization.id,
		});

		if (result?.data?.success) {
			toast.success("Specialization deleted successfully!");

			// Invalidate specialization queries to refresh the list
			await queryClient.invalidateQueries({
				queryKey: ["specializations", "all"],
			});

			// Close dialog
			onOpenChange(false);
		} else if (result?.validationErrors?._errors) {
			const errorMessage =
				result.validationErrors._errors[0] ||
				"Failed to delete specialization";
			toast.error(errorMessage);
		}

		setIsDeleting(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-[450px]">
				<DialogHeader>
					<DialogTitle>Delete Specialization</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete "{specialization.name}"?
					</DialogDescription>
				</DialogHeader>

				<div className="rounded-lg bg-destructive/10 p-4">
					<p className="text-sm text-destructive">
						This action cannot be undone. If any users have this specialization,
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