import { Badge } from "@/components/ui/badge";

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

export const createWinColumns = () => {
	const winColumnHelper = createColumnHelper<any>();
	return [
		winColumnHelper.accessor("title", {
			header: "Title",
		}),
		winColumnHelper.accessor("description", {
			header: "Description",
		}),
		winColumnHelper.accessor("win_date", {
			header: "Win Date",
			cell: (info) => formatDate(info.getValue()),
		}),
		winColumnHelper.accessor("recorded_by_user.name", {
			header: "Recorded By",
			cell: (info) => info.getValue() || "Unknown User",
		}),
		winColumnHelper.accessor("client_win_tags", {
			header: "Tags",
			cell: (info) => {
				const winTags = info.getValue();

				if (!winTags || winTags.length === 0) {
					return <span className="text-muted-foreground text-xs">No tags</span>;
				}

				return (
					<div className="flex flex-wrap gap-1">
						{winTags.map((winTag: any, index: number) => {
							const tag = winTag.win_tags;
							if (!tag) return null;

							return (
								<Badge
									key={tag.id || index}
									variant="secondary"
									style={{
										backgroundColor: tag.color + "20",
										color: tag.color,
										borderColor: tag.color,
									}}
									className="text-xs"
								>
									{tag.name}
								</Badge>
							);
						})}
					</div>
				);
			},
		}),
	];
};

export const createWinRowActions = (setDeleteModal: any, setEditModal: any) => [
	{
		label: "Edit",
		icon: Edit,
		onClick: (win: any) => {
			setEditModal({
				isOpen: true,
				type: "win",
				data: win,
			});
		},
	},
	{
		label: "Delete",
		icon: Trash2,
		variant: "destructive" as const,
		onClick: (win: any) => {
			setDeleteModal({
				isOpen: true,
				type: "win",
				id: win.id,
				title: `Delete win "${win.title}"`,
			});
		},
	},
];
