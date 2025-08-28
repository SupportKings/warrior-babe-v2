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
	CalendarIcon,
	EditIcon,
	EyeIcon,
	PlusIcon,
	TrashIcon,
	UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { deleteClientActivityPeriod } from "../actions/deleteClientActivityPeriod";
import { useClientActivityPeriodsWithFaceted } from "../queries/useClientActivityPeriod";
import { ClientActivityPeriodDeleteModal } from "./client-activity-period-delete-modal";

// Type for client activity period row from Supabase with relations
type ClientActivityPeriodRow =
	Database["public"]["Tables"]["client_activity_period"]["Row"] & {
		client?: {
			id: string;
			name: string;
			email: string;
		} | null;
		coach?: {
			id: number;
			name: string | null;
			user: {
				id: string;
				name: string;
				email: string;
			} | null;
		} | null;
	};

// Create column helper for TanStack table
const columnHelper = createColumnHelper<ClientActivityPeriodRow>();

// TanStack table column definitions
const clientActivityPeriodTableColumns = [
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
	columnHelper.display({
		id: "client",
		header: "Client",
		enableColumnFilter: true,
		cell: ({ row }) => {
			const client = row.original.client;
			return (
				<div className="font-medium">{client?.name || "Unknown Client"}</div>
			);
		},
	}),
	columnHelper.accessor("start_date", {
		id: "start_date",
		header: "Start Date",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => {
			const date = row.getValue<string>("start_date");
			if (!date) return null;
			return format(new Date(date), "MMM dd, yyyy");
		},
	}),
	columnHelper.accessor("end_date", {
		id: "end_date",
		header: "End Date",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => {
			const date = row.getValue<string | null>("end_date");
			if (!date) return <span className="text-muted-foreground">Ongoing</span>;
			return format(new Date(date), "MMM dd, yyyy");
		},
	}),
	columnHelper.display({
		id: "coach",
		header: "Coach",
		enableColumnFilter: true,
		cell: ({ row }) => {
			const coach = row.original.coach;
			return (
				<div className="text-sm">{coach?.name || "No coach assigned"}</div>
			);
		},
	}),
	columnHelper.display({
		id: "activity",
		header: "Activity",
		enableColumnFilter: false,
		cell: ({ row }) => {
			const isActive = row.original.active;
			return <StatusBadge>{isActive ? "Active" : "Inactive"}</StatusBadge>;
		},
	}),
];

// Filter configuration using universal column helper
const universalColumnHelper =
	createUniversalColumnHelper<ClientActivityPeriodRow>();

const clientActivityPeriodFilterConfig = [
	universalColumnHelper
		.option("client")
		.displayName("Client")
		.icon(UserIcon)
		.build(),
	universalColumnHelper
		.option("coach")
		.displayName("Coach")
		.icon(UserIcon)
		.build(),
	universalColumnHelper
		.date("start_date")
		.displayName("Start Date")
		.icon(CalendarIcon)
		.build(),
	universalColumnHelper
		.date("end_date")
		.displayName("End Date")
		.icon(CalendarIcon)
		.build(),
];

function ClientActivityPeriodsTableContent({
	filters,
	setFilters,
}: {
	filters: any;
	setFilters: any;
}) {
	const queryClient = useQueryClient();
	const [activityPeriodToDelete, setActivityPeriodToDelete] =
		useState<ClientActivityPeriodRow | null>(null);
	const [currentPage, setCurrentPage] = useState(0);
	const [sorting, setSorting] = useState<any[]>([]);

	// Reset to first page when filters change
	useEffect(() => {
		setCurrentPage(0);
	}, [filters]);

	// Fetch client activity periods data with faceted data in single optimized call
	const {
		data: clientActivityPeriodsWithFaceted,
		isLoading,
		isError,
		error,
	} = useClientActivityPeriodsWithFaceted(
		filters,
		currentPage,
		25,
		sorting,
		["client", "coach"], // faceted columns for dropdowns
	);

	// Extract data from combined result
	const clientActivityPeriodsData = clientActivityPeriodsWithFaceted
		? {
				data: clientActivityPeriodsWithFaceted.clientActivityPeriods,
				count: clientActivityPeriodsWithFaceted.totalCount,
			}
		: { data: [], count: 0 };

	// Extract faceted data for options with counts
	const clientFaceted =
		clientActivityPeriodsWithFaceted?.facetedData?.client || [];
	const coachFaceted =
		clientActivityPeriodsWithFaceted?.facetedData?.coach || [];

	// Create dynamic filter config with options from faceted data
	const dynamicFilterConfig = [
		{
			...universalColumnHelper
				.option("client")
				.displayName("Client")
				.icon(UserIcon)
				.build(),
			options: clientFaceted.map((item: any) => ({
				value: item.value,
				label: item.label,
				count: item.count,
			})),
		},
		{
			...universalColumnHelper
				.option("coach")
				.displayName("Coach")
				.icon(UserIcon)
				.build(),
			options: coachFaceted.map((item: any) => ({
				value: item.value,
				label: item.label,
				count: item.count,
			})),
		},
		universalColumnHelper
			.date("start_date")
			.displayName("Start Date")
			.icon(CalendarIcon)
			.build(),
		universalColumnHelper
			.date("end_date")
			.displayName("End Date")
			.icon(CalendarIcon)
			.build(),
	];

	const rowActions = [
		{
			label: "View Details",
			icon: EyeIcon,
			onClick: (activityPeriod: ClientActivityPeriodRow) => {
				// Placeholder - just show alert for now
				alert(`View activity period ${activityPeriod.id}`);
			},
		},
		{
			label: "Edit",
			icon: EditIcon,
			onClick: (activityPeriod: ClientActivityPeriodRow) => {
				// Placeholder - just show alert for now
				alert(`Edit activity period ${activityPeriod.id}`);
			},
		},
		{
			label: "Delete",
			icon: TrashIcon,
			variant: "destructive" as const,
			onClick: (activityPeriod: ClientActivityPeriodRow) => {
				setActivityPeriodToDelete(activityPeriod);
			},
		},
	];

	const { table, filterColumns, filterState, actions, strategy, totalCount } =
		useUniversalTable<ClientActivityPeriodRow>({
			data: clientActivityPeriodsData?.data || [],
			totalCount: clientActivityPeriodsData?.count || 0,
			columns: clientActivityPeriodTableColumns,
			columnsConfig: dynamicFilterConfig,
			filters,
			onFiltersChange: setFilters,
			faceted: {},
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
						Error loading client activity periods: {error?.message}
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
					numCols={clientActivityPeriodTableColumns.length}
					numRows={10}
				/>
			) : (
				<UniversalDataTable
					table={table}
					actions={actions}
					totalCount={totalCount}
					rowActions={rowActions}
					emptyStateMessage="No client activity periods found matching your filters"
					emptyStateAction={
						<Button size="sm" className="gap-2" asChild>
							<Link href="">
								<PlusIcon className="h-4 w-4" />
								Add Client Activity Period
							</Link>
						</Button>
					}
				/>
			)}

			{activityPeriodToDelete && (
				<ClientActivityPeriodDeleteModal
					clientActivityPeriod={activityPeriodToDelete}
					open={!!activityPeriodToDelete}
					onOpenChange={(open) => !open && setActivityPeriodToDelete(null)}
					onConfirm={async () => {
						const activityPeriodId = activityPeriodToDelete.id;

						if (!activityPeriodId) {
							toast.error("Activity period ID is missing");
							throw new Error("Activity period ID is missing");
						}

						try {
							await deleteClientActivityPeriod({ id: activityPeriodId });

							// Refresh the table after successful deletion
							queryClient.invalidateQueries({
								queryKey: ["client_activity_periods"],
							});
							setActivityPeriodToDelete(null);

							// Show success toast
							toast.success("Activity period has been deleted successfully");
						} catch (error) {
							// Show error toast
							toast.error(
								"Failed to delete activity period. Please try again.",
							);
							throw error;
						}
					}}
				/>
			)}
		</div>
	);
}

export function ClientActivityPeriodsDataTable() {
	return (
		<UniversalDataTableWrapper<ClientActivityPeriodRow>
			table="client_activity_periods"
			columns={clientActivityPeriodTableColumns}
			columnsConfig={clientActivityPeriodFilterConfig}
			urlStateKey="clientActivityPeriodFilters"
		>
			{(state) => <ClientActivityPeriodsTableContent {...state} />}
		</UniversalDataTableWrapper>
	);
}
