import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { StatusBadge } from "@/components/ui/status-badge";

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
          <div className="text-sm text-muted-foreground">{client.email}</div>
        </div>
      ) : (
        "Unknown Client"
      );
    },
  }),
  columnHelper.accessor("assignment_type", {
    header: "Assignment Type",
    cell: (info) => <div className="font-medium">{info.getValue()}</div>,
  }),
  columnHelper.accessor("start_date", {
    header: "Start Date",
    cell: (info) => {
      const date = info.getValue();
      return date ? format(new Date(date), "MMM dd, yyyy") : "N/A";
    },
  }),
  columnHelper.accessor("end_date", {
    header: "End Date",
    cell: (info) => {
      const date = info.getValue();
      return date ? format(new Date(date), "MMM dd, yyyy") : "N/A";
    },
  }),
];
