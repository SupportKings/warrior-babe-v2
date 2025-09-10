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

export const createEmailColumns = () => {
	const emailColumnHelper = createColumnHelper<any>();
	return [
		emailColumnHelper.accessor("email", {
			header: "Email Address",
			cell: (info) => (
				<span className="font-mono text-sm">
					{info.getValue()}
				</span>
			),
		}),
		emailColumnHelper.accessor("created_at", {
			header: "Added Date",
			cell: (info) => formatDate(info.getValue()),
		}),
	];
};

export const createEmailRowActions = (setDeleteModal: any, setEditModal: any) => [
	{
		label: "Edit",
		icon: Edit,
		onClick: (email: any) => {
			setEditModal({
				isOpen: true,
				type: "email",
				data: email,
			});
		},
	},
	{
		label: "Delete",
		icon: Trash2,
		variant: "destructive" as const,
		onClick: (email: any) => {
			setDeleteModal({
				isOpen: true,
				type: "email",
				id: email.id,
				title: `Delete email (${email.email})`,
			});
		},
	},
];