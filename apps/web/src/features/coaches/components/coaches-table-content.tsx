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
import { createUniversalColumnHelper } from "@/components/universal-data-table/utils/column-helpers";

import { useQueryClient } from "@tanstack/react-query";
import {
	CalendarIcon,
	EditIcon,
	EyeIcon,
	FileTextIcon,
	MailIcon,
	PlusIcon,
	TrashIcon,
	UserIcon,
	UsersIcon,
} from "lucide-react";
import { toast } from "sonner";
import { deleteCoach } from "../actions/delete-coach";
import { useCoachesTable, useTeamLeaders } from "../queries/useCoaches";
import type { CoachRow } from "../types";
import { CoachDeleteModal } from "./coach-delete-modal";
import { coachesFilterConfig } from "./coaches-filter-config";
import { coachesTableColumns } from "./coaches-table-columns";

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

  // Fetch coaches data
  const {
    data: coachesResponse,
    isLoading,
    isError,
    error,
  } = useCoachesTable(
    filters,
    currentPage,
    25,
    sorting
  );
  
  // Fetch team leaders for filter options
  const { data: teamLeaders } = useTeamLeaders();
  // Extract data from response
  const coachesData = coachesResponse
    ? {
        data: coachesResponse.coaches,
        count: coachesResponse.totalCount,
      }
    : { data: [], count: 0 };

	// Create universal column helper
	const universalColumnHelper = createUniversalColumnHelper<CoachRow>();

  // Extract unique contract types from the data
  const uniqueContractTypes = new Set<string>();
  coachesData?.data?.forEach((coach: any) => {
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
        .option("premier_coach_id")
        .displayName("Premier Coach")
        .icon(UsersIcon)
        .build(),
      options: teamLeaders?.map((leader) => ({
        value: leader.premier_coach_id, // Use the team_members ID of the premier coach
        label: leader.name, // Show premier coach name
      })) || [],
    },
    {
      ...universalColumnHelper
        .option("contract_type")
        .displayName("Contract Type")
        .icon(FileTextIcon)
        .build(),
      options: Array.from(uniqueContractTypes).map((type) => ({
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
      data: (coachesData?.data as any) || [],
      totalCount: coachesData?.count || 0,
      columns: coachesTableColumns,
      columnsConfig: dynamicFilterConfig,
      filters,
      onFiltersChange: setFilters,
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
							const result = await deleteCoach(coachId);

							if (result.success) {
								// Refresh the table after successful deletion
								queryClient.invalidateQueries({ queryKey: ["coaches"] });
								setCoachToDelete(null);

								// Show success toast
								toast.success(result.message);
							} else {
								// Show error toast
								toast.error(result.message);
							}
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
