"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import type { CoachRow } from "../types";

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
  columnHelper.accessor("email", {
    id: "email",
    header: "Email",
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => {
      const email = row.getValue<string>("email");
      return (
        <div className="text-sm text-muted-foreground">{email || "—"}</div>
      );
    },
  }),
  columnHelper.accessor("roles", {
    id: "roles",
    header: "Roles",
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => {
      const roles = row.getValue<string | null>("roles");
      if (!roles) return <span className="text-muted-foreground">—</span>;

      // Split roles by comma or semicolon and render as badges
      const rolesList = roles
        .split(/[,;]/)
        .map((r) => r.trim())
        .filter(Boolean);

      return (
        <div className="flex flex-wrap gap-1">
          {rolesList.map((role, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-input bg-background hover:bg-accent hover:text-accent-foreground"
            >
              {role}
            </span>
          ))}
        </div>
      );
    },
  }),
  columnHelper.accessor("team_id", {
    id: "team_id",
    header: "Team",
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => {
      const teamId = row.getValue<string | null>("team_id");

      // Get the team name from the coach_teams relation
      if (teamId) {
        // For now just show the team_id, but this should be enhanced to show team name
        return <div className="text-sm font-medium">Team {teamId}</div>;
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

      return (
        <span className="inline-flex items-center rounded-md bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
          {contractType}
        </span>
      );
    },
  }),
  columnHelper.accessor("created_at", {
    id: "created_at",
    header: "Created",
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => {
      const date = row.getValue<string>("created_at");
      if (!date) return <span className="text-muted-foreground">—</span>;
      return (
        <div className="text-sm text-muted-foreground">
          {format(new Date(date), "MMM dd, yyyy")}
        </div>
      );
    },
  }),
];
