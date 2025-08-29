import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

import {
	formatPaymentStatus,
	getPaymentStatusColor,
} from "@/features/coaches/utils/payment-status-colors";

import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";

type CoachPayment = {
	id: string;
	date: string;
	total_clients: number;
	total_active_clients: number;
	status: string;
};

interface ColumnOptions {
	onEdit: (paymentId: string) => void;
	onDelete: (paymentId: string) => void;
}

const columnHelper = createColumnHelper<CoachPayment>();

export const coachPaymentColumns = (options: ColumnOptions) => [
	columnHelper.accessor("date", {
		header: "Date",
		cell: (info) => {
			const date = info.getValue();
			return date ? format(new Date(date), "MMM dd, yyyy") : "N/A";
		},
	}),
	columnHelper.accessor("total_clients", {
		header: "Total Clients",
		cell: (info) => {
			const count = info.getValue();
			return <span className="font-medium">{count || 0}</span>;
		},
	}),
	columnHelper.accessor("total_active_clients", {
		header: "Total Active Clients",
		cell: (info) => {
			const count = info.getValue();
			return <span className="font-medium">{count || 0}</span>;
		},
	}),
	columnHelper.accessor("status", {
		header: "Status",
		cell: (info) => {
			const status = info.getValue();
			return status ? (
				<StatusBadge colorScheme={getPaymentStatusColor(status)}>
					{formatPaymentStatus(status)}
				</StatusBadge>
			) : (
				<span className="text-muted-foreground">N/A</span>
			);
		},
	}),
	columnHelper.display({
		id: "actions",
		header: "Actions",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => options.onEdit(row.original.id)}
				>
					<Edit className="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => options.onDelete(row.original.id)}
				>
					<Trash2 className="h-4 w-4 text-destructive" />
				</Button>
			</div>
		),
	}),
];
