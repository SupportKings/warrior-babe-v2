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

export const createTestimonialColumns = () => {
	const testimonialColumnHelper = createColumnHelper<any>();
	return [
		testimonialColumnHelper.accessor("content", {
			header: "Content",
			cell: (info) => (
				<div className="max-w-xs truncate" title={info.getValue()}>
					{info.getValue()}
				</div>
			),
		}),
		testimonialColumnHelper.accessor("testimonial_type", {
			header: "Type",
			cell: (info) => <StatusBadge>{info.getValue()}</StatusBadge>,
		}),
		testimonialColumnHelper.accessor("testimonial_url", {
			header: "URL",
			cell: (info) =>
				info.getValue() ? (
					<a
						href={info.getValue()}
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-600 hover:underline"
					>
						View
					</a>
				) : null,
		}),
		testimonialColumnHelper.accessor("recorded_date", {
			header: "Recorded Date",
			cell: (info) => formatDate(info.getValue()),
		}),
	];
};

export const createTestimonialRowActions = (
	setDeleteModal: any,
	setEditModal: any,
) => [
	{
		label: "Edit",
		icon: Edit,
		onClick: (testimonial: any) => {
			setEditModal({
				isOpen: true,
				type: "testimonial",
				data: testimonial,
			});
		},
	},
	{
		label: "Delete",
		icon: Trash2,
		variant: "destructive" as const,
		onClick: (testimonial: any) => {
			setDeleteModal({
				isOpen: true,
				type: "testimonial",
				id: testimonial.id,
				title: "Delete testimonial",
			});
		},
	},
];
