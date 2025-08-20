"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAction } from "next-safe-action/hooks";
import { deleteGoalType } from "../actions/deleteGoalType";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { goalTypeQueries } from "../queries/goalTypes.queries";
import type { GoalType } from "../types/goalType";

interface DeleteGoalTypeDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	goalType: GoalType;
}

export default function DeleteGoalTypeDialog({
	open,
	onOpenChange,
	goalType,
}: DeleteGoalTypeDialogProps) {
	const queryClient = useQueryClient();

	const { executeAsync, isPending } = useAction(deleteGoalType);

	const handleDelete = async () => {
		const result = await executeAsync({ id: goalType.id });

		if (result?.data?.success) {
			toast.success("Goal type deleted successfully");
			queryClient.invalidateQueries({ queryKey: goalTypeQueries.allGoalTypes().queryKey });
			onOpenChange(false);
		} else if (result?.validationErrors?._errors) {
			const errorMessage = result.validationErrors._errors[0] || "Failed to delete goal type";
			toast.error(errorMessage);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Delete Goal Type</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete "{goalType.name}"? This action cannot be undone.
						The goal type will be deactivated and will no longer be available for new client goals.
					</DialogDescription>
				</DialogHeader>

				<div className="rounded-lg bg-muted/50 p-4">
					<div className="flex items-center space-x-3">
						<div>
							<h4 className="font-medium">{goalType.name}</h4>
							{goalType.category && (
								<p className="text-sm text-muted-foreground">{goalType.category}</p>
							)}
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isPending}
					>
						Cancel
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={handleDelete}
						disabled={isPending}
					>
						{isPending ? "Deleting..." : "Delete Goal Type"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}