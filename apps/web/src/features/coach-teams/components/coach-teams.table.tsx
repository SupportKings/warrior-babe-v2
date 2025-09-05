"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { createClient } from "@/utils/supabase/client";
import type { Database } from "@/utils/supabase/database.types";

import { DataTableFilter } from "@/components/data-table-filter";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useUniversalTable } from "@/components/universal-data-table/hooks/use-universal-table";
import {
	UniversalTableFilterSkeleton,
	UniversalTableSkeleton,
} from "@/components/universal-data-table/table-skeleton";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";
import { UniversalDataTableWrapper } from "@/components/universal-data-table/universal-data-table-wrapper";
import { createUniversalColumnHelper } from "@/components/universal-data-table/utils/column-helpers";

import { useQuery } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import { EditIcon, EyeIcon, PlusIcon, TrashIcon, UserIcon } from "lucide-react";
import { toast } from "sonner";
import { useCoachTeamsWithFaceted } from "../queries/usecoach-teams";

// Fetch all team members for filter options
async function getAllTeamMembers() {
	const supabase = createClient();
	const { data, error } = await supabase
		.from("team_members")
		.select(`
			id,
			name,
			user:user!team_members_user_id_fkey (
				id,
				name,
				email
			)
		`)
		.order("name", { ascending: true });

	if (error) {
		console.error("Error fetching team members:", error);
		return [];
	}

	return data || [];
}

// Hook to fetch team members for filters
function useTeamMembers() {
	return useQuery({
		queryKey: ["team-members", "all"],
		queryFn: getAllTeamMembers,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Type for coach-team row from Supabase with relations
type CoachTeamRow = Database["public"]["Tables"]["coach_teams"]["Row"] & {
	premier_coach?: {
		id: string;
		name: string | null;
		user: {
			id: string;
			name: string;
			email: string;
		} | null;
	} | null;
	coach_count?: number;
};

// Create column helper for TanStack table
const columnHelper = createColumnHelper<CoachTeamRow>();

// TanStack table column definitions
const coachTeamTableColumns = [
	columnHelper.display({
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
	columnHelper.accessor("team_name", {
		header: "Team Name",
		enableColumnFilter: false,
		cell: ({ getValue }) => (
			<div className="font-medium">{getValue() || "Unnamed Team"}</div>
		),
	}),
	columnHelper.display({
		id: "premier_coach",
		header: "Premier Coach",
		enableColumnFilter: false,
		cell: ({ row }) => {
			const premierCoach = row.original.premier_coach;
			return (
				<div className="text-sm">
					{premierCoach?.name || "No premier coach"}
				</div>
			);
		},
	}),
	columnHelper.display({
		id: "coach_count",
		header: "Number of Coaches",
		enableColumnFilter: false,
		cell: ({ row }) => {
			const coachCount = row.original.coach_count || 0;
			return (
				<div className="text-sm">
					<span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 font-medium text-blue-800 text-xs">
						{coachCount} {coachCount === 1 ? "coach" : "coaches"}
					</span>
				</div>
			);
		},
	}),
];

// Filter configuration using universal column helper
const universalColumnHelper = createUniversalColumnHelper<CoachTeamRow>();

const coachTeamFilterConfig = [
	universalColumnHelper
		.option("premier_coach_id")
		.displayName("Premier Coach")
		.icon(UserIcon)
		.build(),
];

function CoachTeamsTableContent({
	filters,
	setFilters,
}: {
	filters: any;
	setFilters: any;
}) {
	const [currentPage, setCurrentPage] = useState(0);
	const [sorting, setSorting] = useState<any[]>([]);

	// Fetch team members for filter options
	const { data: teamMembers, isLoading: isLoadingTeamMembers } =
		useTeamMembers();

	// Reset to first page when filters change
	useEffect(() => {
		setCurrentPage(0);
	}, [filters]);

	// Fetch coach teams data with faceted data in single optimized call
	const {
		data: coachTeamsWithFaceted,
		isLoading,
		isError,
		error,
	} = useCoachTeamsWithFaceted(
		filters,
		currentPage,
		25,
		sorting,
		[], // columns to get faceted data for
	);

	// Extract data from combined result
	const coachTeamsData = coachTeamsWithFaceted
		? {
				data: coachTeamsWithFaceted.coachTeams,
				count: coachTeamsWithFaceted.totalCount,
			}
		: { data: [], count: 0 };

	// Create dynamic filter config with team members options
	const teamMemberOptions =
		teamMembers?.map((member) => ({
			value: member.id,
			label:
				member.name || member.user?.name || member.user?.email || "Unknown",
		})) || [];

	const dynamicFilterConfig = [
		{
			...universalColumnHelper
				.option("premier_coach_id")
				.displayName("Premier Coach")
				.icon(UserIcon)
				.build(),
			options: teamMemberOptions,
		},
	];

	const rowActions = [
		{
			label: "View Details",
			icon: EyeIcon,
			onClick: () => {
				// Placeholder
				toast.info("View details coming soon");
			},
		},
		{
			label: "Edit",
			icon: EditIcon,
			onClick: () => {
				// Placeholder
				toast.info("Edit coming soon");
			},
		},
		{
			label: "Delete",
			icon: TrashIcon,
			variant: "destructive" as const,
			onClick: () => {
				// Placeholder
				toast.info("Delete coming soon");
			},
		},
	];

	const { table, filterColumns, filterState, actions, strategy, totalCount } =
		useUniversalTable<CoachTeamRow>({
			data: coachTeamsData?.data || [],
			totalCount: coachTeamsData?.count || 0,
			columns: coachTeamTableColumns,
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
	const isFilterDataPending = isLoadingTeamMembers;

	if (isError) {
		return (
			<div className="w-full">
				<div className="space-y-2 text-center">
					<p className="text-red-600">
						Error loading coach teams: {error?.message}
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
					numCols={coachTeamTableColumns.length}
					numRows={10}
				/>
			) : (
				<UniversalDataTable
					table={table}
					actions={actions}
					totalCount={totalCount}
					rowActions={rowActions}
					emptyStateMessage="No coach teams found matching your filters"
					emptyStateAction={
						<Button size="sm" className="gap-2" asChild>
							<Link href="#">
								<PlusIcon className="h-4 w-4" />
								Add Coach Team
							</Link>
						</Button>
					}
				/>
			)}
		</div>
	);
}

export function CoachTeamsDataTable() {
	return (
		<UniversalDataTableWrapper<CoachTeamRow>
			table="coach-teams"
			columns={coachTeamTableColumns}
			columnsConfig={coachTeamFilterConfig}
			urlStateKey="coachTeamFilters"
		>
			{(state) => <CoachTeamsTableContent {...state} />}
		</UniversalDataTableWrapper>
	);
}
