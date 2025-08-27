"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { createColumnHelper } from "@tanstack/react-table";
import type { CoachRow } from "../types";

// Function to get contract type badge styling
function getContractTypeBadgeClass(contractType: string | null): string {
  if (!contractType) return "bg-muted text-muted-foreground";
  
  const type = contractType.toLowerCase();
  
  if (type === "w2" || type === "w-2") {
    // Full-time employee - primary/default style
    return "bg-primary/10 text-primary";
  } else if (type === "hourly" || type.includes("hour")) {
    // Hourly contractor - secondary style
    return "bg-secondary text-secondary-foreground";
  } else if (type === "contractor" || type === "1099") {
    // Independent contractor - accent style
    return "bg-accent text-accent-foreground";
  } else if (type === "salary" || type.includes("salary")) {
    // Salaried - similar to W2 but slightly different
    return "bg-primary/15 text-primary";
  } else {
    // Default/Unknown - muted style
    return "bg-muted text-muted-foreground";
  }
}

// Create column helper for TanStack table
const columnHelper = createColumnHelper<CoachRow>();

// TanStack table column definitions
export const coachesTableColumns = [
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
  }),
  columnHelper.accessor("name", {
    id: "name",
    header: "Name",
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => {
      const name = row.getValue<string>("name");
      return <div className="font-medium">{name || "—"}</div>;
    },
  }),
  columnHelper.accessor((row) => row.user?.email, {
    id: "email",
    header: "Email",
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => {
      const email = row.original.user?.email;
      return (
        <div className="text-sm text-muted-foreground">{email || "No email"}</div>
      );
    },
  }),
  columnHelper.accessor((row) => row.team?.premier_coach?.name, {
    id: "premier_coach",
    header: "Assigned Premier Coach",
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => {
      const premierCoachName = row.original.team?.premier_coach?.name;
      
      if (premierCoachName) {
        return <div className="text-sm font-medium">{premierCoachName}</div>;
      }

      return <span className="text-sm text-muted-foreground">Unassigned</span>;
    },
  }),
  columnHelper.accessor("contract_type", {
    id: "contract_type",
    header: "Contract Type",
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => {
      const contractType = row.getValue<string | null>("contract_type");
      if (!contractType)
        return <span className="text-muted-foreground">—</span>;

      const badgeClass = getContractTypeBadgeClass(contractType);
      
      return (
        <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}>
          {contractType}
        </span>
      );
    },
  }),
];
