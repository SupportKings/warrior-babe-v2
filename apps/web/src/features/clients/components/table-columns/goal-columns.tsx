import { StatusBadge } from "@/components/ui/status-badge";

import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(new Date(dateString), "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

export const createGoalColumns = () => {
	const goalColumnHelper = createColumnHelper<any>();
	return [
		goalColumnHelper.accessor("title", {
			header: "Title",
		}),
		goalColumnHelper.accessor("description", {
			header: "Description",
		}),
		goalColumnHelper.accessor("status", {
			header: "Status",
			cell: (info) =>
				info.getValue() ? <StatusBadge>{info.getValue()}</StatusBadge> : null,
		}),
		goalColumnHelper.accessor("priority", {
			header: "Priority",
			cell: (info) =>
				info.getValue() ? <StatusBadge>{info.getValue()}</StatusBadge> : null,
		}),
		goalColumnHelper.accessor("target_value", {
			header: "Target",
		}),
		goalColumnHelper.accessor("current_value", {
			header: "Current",
		}),
		goalColumnHelper.accessor("due_date", {
			header: "Due Date",
			cell: (info) => formatDate(info.getValue()),
		}),
	];
};

export const createGoalRowActions = (
	setDeleteModal: any,
	setEditModal: any,
) => [
	{
		label: "Edit",
		icon: Edit,
		onClick: (goal: any) => {
			setEditModal({
				isOpen: true,
				type: "goal",
				data: goal,
			});
		},
	},
	{
		label: "Delete",
		icon: Trash2,
		variant: "destructive" as const,
		onClick: (goal: any) => {
			setDeleteModal({
				isOpen: true,
				type: "goal",
				id: goal.id,
				title: `Delete goal "${goal.title}"`,
			});
		},
	},
];
