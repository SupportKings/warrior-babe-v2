"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import type { Database } from "@/utils/supabase/database.types";

import { DataTableFilter } from "@/components/data-table-filter";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/ui/status-badge";
import { useUniversalTable } from "@/components/universal-data-table/hooks/use-universal-table";
import {
	UniversalTableFilterSkeleton,
	UniversalTableSkeleton,
} from "@/components/universal-data-table/table-skeleton";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";
import { UniversalDataTableWrapper } from "@/components/universal-data-table/universal-data-table-wrapper";
import { createUniversalColumnHelper } from "@/components/universal-data-table/utils/column-helpers";

import { useQueryClient } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import {
	CalendarIcon, EyeIcon,
	MailIcon,
	PackageIcon,
	PlusIcon,
	TagIcon,
	TrashIcon,
	UserIcon
} from "lucide-react";
import { toast } from "sonner";
import { deleteClient } from "../actions/deleteClient";
import { useClientsWithFaceted } from "../queries/useClients";
import { ClientDeleteModal } from "./client.delete.modal";

// Type for client row from Supabase with relations
type ClientRow = Database["public"]["Tables"]["clients"]["Row"] & {
	client_assignments?: Array<{
		id: string;
		coach_id: string | null;
		assignment_type: string;
		start_date: string;
		end_date: string | null;
		coach: {
			id: string;
			name: string | null;
			user: {
				id: string;
				name: string;
				email: string;
			} | null;
		} | null;
	}>;
};

// Create column helper for TanStack table
const columnHelper = createColumnHelper<ClientRow>();

// TanStack table column definitions
const clientTableColumns = [
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
			return <div className="font-medium">{name}</div>;
		},
	}),
	columnHelper.accessor("email", {
		id: "email",
		header: "Email",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => (
			<div className="text-muted-foreground">{row.getValue("email")}</div>
		),
	}),
	columnHelper.display({
		id: "coach",
		header: "Coach",
		enableColumnFilter: false,
		cell: ({ row }) => {
			const assignments = row.original.client_assignments;
			const activeAssignment = assignments?.find((a) => !a.end_date);
			const coach = activeAssignment?.coach;
			return (
				<div className="text-sm">
					{coach?.user?.name || coach?.name || "No coach assigned"}
				</div>
			);
		},
	}),
	columnHelper.accessor("overall_status", {
		id: "overall_status",
		header: "Status",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => {
			const status = row.getValue<string>("overall_status");
			return <StatusBadge>{status || "unknown"}</StatusBadge>;
		},
	}),
	columnHelper.accessor("created_at", {
		id: "created_at",
		header: "Created",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => {
			const date = row.getValue<string>("created_at");
			if (!date) return null;
			return format(new Date(date), "MMM dd, yyyy");
		},
	}),
];

// Filter configuration using universal column helper
const universalColumnHelper = createUniversalColumnHelper<ClientRow>();

const clientFilterConfig = [
	universalColumnHelper.text("name").displayName("Name").icon(UserIcon).build(),
	universalColumnHelper
		.text("email")
		.displayName("Email")
		.icon(MailIcon)
		.build(),
	universalColumnHelper
		.text("phone")
		.displayName("Phone")
		.icon(UserIcon)
		.build(),
	universalColumnHelper
		.option("overall_status")
		.displayName("Status")
		.icon(TagIcon)
		.build(),
	universalColumnHelper
		.option("everfit_access")
		.displayName("Everfit Access")
		.icon(PackageIcon)
		.build(),
	universalColumnHelper
		.date("created_at")
		.displayName("Created Date")
		.icon(CalendarIcon)
		.build(),
];

function ClientsTableContent({
	filters,
	setFilters,
}: {
	filters: any;
	setFilters: any;
}) {
	const queryClient = useQueryClient();
	const [clientToDelete, setClientToDelete] = useState<ClientRow | null>(null);
	const [currentPage, setCurrentPage] = useState(0);
	const [sorting, setSorting] = useState<any[]>([]);

	// Reset to first page when filters change
	useEffect(() => {
		setCurrentPage(0);
	}, [filters]);

	// Fetch clients data with faceted data in single optimized call
	const {
		data: clientsWithFaceted,
		isLoading,
		isError,
		error,
	} = useClientsWithFaceted(
		filters,
		currentPage,
		25,
		sorting,
		["overall_status"], // columns to get faceted data for
	);

	// Extract data from combined result
	const clientsData = clientsWithFaceted
		? {
				data: clientsWithFaceted.clients,
				count: clientsWithFaceted.totalCount,
			}
		: { data: [], count: 0 };

	const overallStatusFaceted = clientsWithFaceted?.facetedData?.overall_status;

	// Create dynamic filter config with proper types based on database schema
	const dynamicFilterConfig = [
		universalColumnHelper
			.text("name")
			.displayName("Name")
			.icon(UserIcon)
			.build(),
		universalColumnHelper
			.text("email")
			.displayName("Email")
			.icon(MailIcon)
			.build(),
		universalColumnHelper
			.text("phone")
			.displayName("Phone")
			.icon(UserIcon)
			.build(),
		{
			...universalColumnHelper
				.option("overall_status")
				.displayName("Status")
				.icon(TagIcon)
				.build(),
			options: [
				{ value: "new", label: "New" },
				{ value: "live", label: "Live" },
				{ value: "paused", label: "Paused" },
				{ value: "churned", label: "Churned" },
			],
		},
		universalColumnHelper
			.option("everfit_access")
			.displayName("Everfit Access")
			.icon(PackageIcon)
			.build(),
		universalColumnHelper
			.date("created_at")
			.displayName("Created Date")
			.icon(CalendarIcon)
			.build(),
	];

	const rowActions = [
		{
			label: "View Details",
			icon: EyeIcon,
			onClick: (client: ClientRow) => {
				window.location.href = `/dashboard/clients/${client.id}`;
			},
		},
		{
			label: "Delete",
			icon: TrashIcon,
			variant: "destructive" as const,
			onClick: (client: ClientRow) => {
				setClientToDelete(client);
			},
		},
	];

	const { table, filterColumns, filterState, actions, strategy, totalCount } =
		useUniversalTable<ClientRow>({
			data: clientsData?.data || [],
			totalCount: clientsData?.count || 0,
			columns: clientTableColumns,
			columnsConfig: dynamicFilterConfig,
			filters,
			onFiltersChange: setFilters,
			faceted: { overall_status: overallStatusFaceted },
			enableSelection: true,
			pageSize: 25,
			serverSide: true,
			rowActions,
			isLoading,
			isError,
			error,
			onPaginationChange: (pageIndex) => {
				setCurrentPage(pageIndex);
			},
			onSortingChange: setSorting,
		});

	// Check if filter options are still loading
	const isFilterDataPending = false;

	if (isError) {
		return (
			<div className="w-full">
				<div className="space-y-2 text-center">
					<p className="text-red-600">
						Error loading clients: {error?.message}
					</p>
					<p className="text-muted-foreground text-sm">
						Please check your database connection and try again.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full">
			<div className="flex items-center gap-2 pb-4">
				{isFilterDataPending ? (
					<UniversalTableFilterSkeleton />
				) : (
					<DataTableFilter
						filters={filterState}
						columns={filterColumns}
						actions={actions}
						strategy={strategy}
					/>
				)}
			</div>

			{isLoading ? (
				<UniversalTableSkeleton
					numCols={clientTableColumns.length}
					numRows={10}
				/>
			) : (
				<UniversalDataTable
					table={table}
					actions={actions}
					totalCount={totalCount}
					rowActions={rowActions}
					emptyStateMessage="No clients found matching your filters"
					emptyStateAction={
						<Button size="sm" className="gap-2" asChild>
							<Link href="/dashboard/clients/add">
								<PlusIcon className="h-4 w-4" />
								Add Client
							</Link>
						</Button>
					}
				/>
			)}

			{clientToDelete && (
				<ClientDeleteModal
					client={clientToDelete}
					open={!!clientToDelete}
					onOpenChange={(open) => !open && setClientToDelete(null)}
					onConfirm={async () => {
						const clientId = clientToDelete.id;
						const clientName = clientToDelete.name;

						if (!clientId) {
							toast.error("Client ID is missing");
							throw new Error("Client ID is missing");
						}

						try {
							await deleteClient({ id: clientId });

							// Refresh the table after successful deletion
							queryClient.invalidateQueries({ queryKey: ["clients"] });
							setClientToDelete(null);

							// Show success toast
							toast.success(`${clientName} has been deleted successfully`);
						} catch (error) {
							// Show error toast
							toast.error(`Failed to delete ${clientName}. Please try again.`);
							throw error;
						}
					}}
				/>
			)}
		</div>
	);
}

export function ClientsDataTable() {
	return (
		<UniversalDataTableWrapper<ClientRow>
			table="clients"
			columns={clientTableColumns}
			columnsConfig={clientFilterConfig}
			urlStateKey="clientFilters"
		>
			{(state) => <ClientsTableContent {...state} />}
		</UniversalDataTableWrapper>
	);
}
