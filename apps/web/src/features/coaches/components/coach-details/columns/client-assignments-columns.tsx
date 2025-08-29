import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";

type ClientAssignment = {
	id: string;
	assignment_type: string;
	start_date: string;
	end_date: string | null;
	client: {
		id: string;
		name: string;
		email: string;
	} | null;
};

const columnHelper = createColumnHelper<ClientAssignment>();

export const clientAssignmentColumns = [
	columnHelper.accessor("client", {
		header: "Client",
		cell: (info) => {
			const client = info.getValue();
			return client ? (
				<div>
					<div className="font-medium">{client.name}</div>
					<div className="text-muted-foreground text-sm">{client.email}</div>
				</div>
			) : (
				"Unknown Client"
			);
		},
	}),
	columnHelper.accessor("start_date", {
		header: "Assignment Start Date",
		cell: (info) => {
			const date = info.getValue();
			return date ? format(new Date(date), "MMM dd, yyyy") : "N/A";
		},
	}),
	columnHelper.display({
		id: "payment_start_date",
		header: "Payment Start Date",
		cell: (info) => {
			const client: any = info.row.original.client;
			const startDate = client?.payment_plans?.[0]?.term_start_date;
			if (startDate) {
				return format(new Date(startDate), "MMM dd, yyyy");
			}
			return "N/A";
		},
	}),
];
