import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Edit, Trash2 } from "lucide-react";

type CoachPayment = {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
};

interface ColumnOptions {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const columnHelper = createColumnHelper<CoachPayment>();

export const coachPaymentColumns = ({ onEdit, onDelete }: ColumnOptions) => [
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => (
      <span>
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("amount", {
    header: "Amount",
    cell: (info) => {
      const amount = info.getValue();
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
    },
  }),
  columnHelper.accessor("created_at", {
    header: "Created",
    cell: (info) => {
      const date = info.getValue();
      return format(new Date(date), "MMM dd, yyyy");
    },
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(row.original.id)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(row.original.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  }),
];