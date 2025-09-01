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

export const createNPSColumns = () => {
	const npsColumnHelper = createColumnHelper<any>();
	return [
		npsColumnHelper.accessor("nps_score", {
			header: "NPS Score",
			cell: (info) => (
				<span
					className={`font-medium ${
						info.getValue() >= 9
							? "text-green-600"
							: info.getValue() >= 7
								? "text-yellow-600"
								: "text-red-600"
					}`}
				>
					{info.getValue()}
				</span>
			),
		}),
		npsColumnHelper.accessor("notes", {
			header: "Notes",
		}),
		npsColumnHelper.accessor("recorded_date", {
			header: "Recorded Date",
			cell: (info) => formatDate(info.getValue()),
		}),
	];
};

export const createNPSRowActions = (setDeleteModal: any, setEditModal: any) => [
	{
		label: "Edit",
		icon: Edit,
		onClick: (npsScore: any) => {
			setEditModal({
				isOpen: true,
				type: "nps",
				data: npsScore,
			});
		},
	},
	{
		label: "Delete",
		icon: Trash2,
		variant: "destructive" as const,
		onClick: (npsScore: any) => {
			setDeleteModal({
				isOpen: true,
				type: "nps",
				id: npsScore.id,
				title: `Delete NPS score (${npsScore.nps_score})`,
			});
		},
	},
];
