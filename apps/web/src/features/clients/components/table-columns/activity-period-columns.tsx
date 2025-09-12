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

export const createActivityPeriodColumns = () => {
	const activityPeriodColumnHelper = createColumnHelper<any>();
	return [
		activityPeriodColumnHelper.accessor("active", {
			header: "Active",
			cell: (info) => (
				<StatusBadge>{info.getValue() ? "Active" : "Inactive"}</StatusBadge>
			),
		}),
		activityPeriodColumnHelper.accessor("is_grace", {
			header: "Type",
			cell: (info) => {
				const isGrace = info.getValue();
				return (
					<StatusBadge colorScheme={isGrace ? "yellow" : "green"}>
						{isGrace ? "Grace Period" : "Regular"}
					</StatusBadge>
				);
			},
		}),
		activityPeriodColumnHelper.accessor("start_date", {
			header: "Start Date",
			cell: (info) => formatDate(info.getValue()),
		}),
		activityPeriodColumnHelper.accessor("end_date", {
			header: "End Date",
			cell: (info) => formatDate(info.getValue()),
		}),
		activityPeriodColumnHelper.accessor("coach_name", {
			header: "Coach",
			cell: (info) =>
				info.getValue() ||
				info.row.original.coach?.name ||
				(info.row.original.coach_id
					? `Coach #${info.row.original.coach_id}`
					: "No coach assigned"),
		}),
	];
};

export const createActivityPeriodRowActions = (
	setDeleteModal: any,
	setEditModal: any,
) => [
	{
		label: "Edit",
		icon: Edit,
		onClick: (activityPeriod: any) => {
			setEditModal({
				isOpen: true,
				type: "activity_period",
				data: activityPeriod,
			});
		},
	},
	{
		label: "Delete",
		icon: Trash2,
		variant: "destructive" as const,
		onClick: (activityPeriod: any) => {
			setDeleteModal({
				isOpen: true,
				type: "activity_period",
				id: activityPeriod.id,
				title: "Delete activity period",
			});
		},
	},
];
