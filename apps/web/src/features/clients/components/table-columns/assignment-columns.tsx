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

export const createAssignmentColumns = () => {
	const assignmentColumnHelper = createColumnHelper<any>();
	return [
		assignmentColumnHelper.accessor("coach.name", {
			header: "Coach",
			cell: (info) =>
				info.getValue() || info.row.original.coach?.name || "Unknown",
		}),
		assignmentColumnHelper.accessor("coach.user.email", {
			header: "Email",
			cell: (info) => info.getValue() || "No email",
		}),
		assignmentColumnHelper.accessor("assignment_type", {
			header: "Type",
		}),
		assignmentColumnHelper.accessor("start_date", {
			header: "Start Date",
			cell: (info) => formatDate(info.getValue()),
		}),
		assignmentColumnHelper.accessor("end_date", {
			header: "End Date",
			cell: (info) => formatDate(info.getValue()),
		}),
	];
};

export const createAssignmentRowActions = (
	setDeleteModal: any,
	setEditModal: any,
) => [
	{
		label: "Edit",
		icon: Edit,
		onClick: (assignment: any) => {
			setEditModal({
				isOpen: true,
				type: "assignment",
				data: assignment,
			});
		},
	},
	{
		label: "Delete",
		icon: Trash2,
		variant: "destructive" as const,
		onClick: (assignment: any) => {
			setDeleteModal({
				isOpen: true,
				type: "assignment",
				id: assignment.id,
				title: `Delete assignment for ${assignment.coach?.name || "Unknown"}`,
			});
		},
	},
];
