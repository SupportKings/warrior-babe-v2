"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { DataTableFilter } from "@/components/data-table-filter";
import { Button } from "@/components/ui/button";
import { useUniversalTable } from "@/components/universal-data-table/hooks/use-universal-table";
import {
	UniversalTableFilterSkeleton,
	UniversalTableSkeleton,
} from "@/components/universal-data-table/table-skeleton";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import { useQueryClient } from "@tanstack/react-query";
import {
	EditIcon,
	EyeIcon,
	PlusIcon,
	TrashIcon,
} from "lucide-react";
import { toast } from "sonner";

import { useCoachesWithFaceted } from "../queries/useCoaches";
import { coachesTableColumns } from "./coaches-table-columns";
import { coachesFilterConfig } from "./coaches-filter-config";
import { CoachDeleteModal } from "./coach-delete-modal";
import { deleteCoach } from "../actions/delete-coach";
import type { CoachRow } from "../types";
import { createUniversalColumnHelper } from "@/components/universal-data-table/utils/column-helpers";
import {
	CalendarIcon,
	MailIcon,
	UserIcon,
	UsersIcon,
	FileTextIcon,
} from "lucide-react";

interface CoachesTableContentProps {
	filters: any;
	setFilters: any;
}

export function CoachesTableContent({
	filters,
	setFilters,
}: CoachesTableContentProps) {
	const queryClient = useQueryClient();
	const [coachToDelete, setCoachToDelete] = useState<CoachRow | null>(null);
	const [currentPage, setCurrentPage] = useState(0);
	const [sorting, setSorting] = useState<any[]>([]);

	// Reset to first page when filters change
	useEffect(() => {
		setCurrentPage(0);
	}, [filters]);

	// Fetch coaches data with faceted data in single optimized call
	const {
		data: coachesWithFaceted,
		isLoading,
		isError,
		error,
	} = useCoachesWithFaceted(
		filters,
		currentPage,
		25,
		sorting,
		["contract_type"] // columns to get faceted data for
	);
console.log(coachesWithFaceted)
	// Extract data from combined result
	const coachesData = coachesWithFaceted
		? {
				data: coachesWithFaceted.coaches,
				count: coachesWithFaceted.totalCount,
		  }
		: { data: [], count: 0 };

	const contractTypeFaceted = coachesWithFaceted?.facetedData?.contract_type;

	// Create universal column helper
	const universalColumnHelper = createUniversalColumnHelper<CoachRow>();

	// Extract unique values for filters from the data
	const uniqueTeams = new Set<string>();
	const uniqueContractTypes = new Set<string>();

	// Process coaches data to extract unique values
	coachesData?.data?.forEach((coach: any) => {
		// Extract team IDs with friendly names
		if (coach.team_id) {
			uniqueTeams.add(coach.team_id);
		}
		
		// Extract contract types
		if (coach.contract_type) {
			uniqueContractTypes.add(coach.contract_type);
		}
	});

	// Create dynamic filter config with options
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
		{
			...universalColumnHelper
				.option("team_id")
				.displayName("Team")
				.icon(UsersIcon)
				.build(),
			options: Array.from(uniqueTeams).map(teamId => ({
				value: teamId,
				label: `Team ${teamId.slice(-4)}`, // Show last 4 chars as friendly name
			})),
		},
		{
			...universalColumnHelper
				.option("contract_type")
				.displayName("Contract Type")
				.icon(FileTextIcon)
				.build(),
			options: Array.from(uniqueContractTypes).map(type => ({
				value: type,
				label: type,
			})),
		},
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
			onClick: (coach: CoachRow) => {
				window.location.href = `/dashboard/coaches/${coach.id}`;
			},
		},
		{
			label: "Edit",
			icon: EditIcon,
			onClick: (coach: CoachRow) => {
				window.location.href = `/dashboard/coaches/${coach.id}/edit`;
			},
		},
		{
			label: "Delete",
			icon: TrashIcon,
			variant: "destructive" as const,
			onClick: (coach: CoachRow) => {
				setCoachToDelete(coach);
			},
		},
	];

	const { table, filterColumns, filterState, actions, strategy, totalCount } =
		useUniversalTable<CoachRow>({
			data: coachesData?.data as any || [],
			totalCount: coachesData?.count || 0,
			columns: coachesTableColumns,
			columnsConfig: dynamicFilterConfig,
			filters,
			onFiltersChange: setFilters,
			faceted: { 
				contract_type: contractTypeFaceted,
			},
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

	if (isError) {
		return (
			<div className="w-full">
				<div className="space-y-2 text-center">
					<p className="text-red-600">
						Error loading coaches: {error?.message}
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
				<DataTableFilter
					filters={filterState}
					columns={filterColumns}
					actions={actions}
					strategy={strategy}
				/>
			</div>

			{isLoading ? (
				<UniversalTableSkeleton
					numCols={coachesTableColumns.length}
					numRows={10}
				/>
			) : (
				<UniversalDataTable
					table={table}
					actions={actions}
					totalCount={totalCount}
					rowActions={rowActions}
					emptyStateMessage="No coaches found matching your filters"
					emptyStateAction={
						<Button size="sm" className="gap-2" asChild>
							<Link href="/dashboard/coaches/new">
								<PlusIcon className="h-4 w-4" />
								Add Coach
							</Link>
						</Button>
					}
				/>
			)}

			{coachToDelete && (
				<CoachDeleteModal
					coach={coachToDelete}
					open={!!coachToDelete}
					onOpenChange={(open) => !open && setCoachToDelete(null)}
					onConfirm={async () => {
						const coachId = coachToDelete.id;
						const coachName = coachToDelete.name;

						if (!coachId) {
							toast.error("Coach ID is missing");
							throw new Error("Coach ID is missing");
						}

						try {
							await deleteCoach({ id: coachId as any });

							// Refresh the table after successful deletion
							queryClient.invalidateQueries({ queryKey: ["coaches"] });
							setCoachToDelete(null);

							// Show success toast
							toast.success(`${coachName} has been deleted successfully`);
						} catch (error) {
							// Show error toast
							toast.error(`Failed to delete ${coachName}. Please try again.`);
							throw error;
						}
					}}
				/>
			)}
		</div>
	);
}