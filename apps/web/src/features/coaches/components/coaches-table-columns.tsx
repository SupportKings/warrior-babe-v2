"use client";

import { Checkbox } from "@/components/ui/checkbox";

import { createColumnHelper } from "@tanstack/react-table";
import type { CoachRow } from "../types";
import { getContractTypeBadgeClass } from "../utils";


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
				<div className="text-muted-foreground text-sm">
					{email || "No email"}
				</div>
			);
		},
	}),
	columnHelper.accessor((row) => row.user?.role, {
		id: "roles",
		header: "Roles",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => {
			const roles = row.original.user?.role;

			if (!roles) {
				return <span className="text-muted-foreground text-sm">No roles</span>;
			}

      const rolesList = roles
        .split(",")
        .map((role) => role.trim())
        .filter(Boolean);

      return (
        <div className="flex flex-wrap gap-1">
          {rolesList.map((role, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground capitalize"
            >
              {role.split("_").join(" ")}
            </span>
          ))}
        </div>
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
				return <div className="font-medium text-sm">{premierCoachName}</div>;
			}

			return <span className="text-muted-foreground text-sm">Unassigned</span>;
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
				<span
					className={`inline-flex items-center rounded-md px-2.5 py-0.5 font-semibold text-xs ${badgeClass}`}
				>
					{contractType}
				</span>
			);
		},
	}),
];
