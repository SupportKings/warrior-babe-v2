"use client";

import type { FiltersState } from "@/components/data-table-filter/core/types";

import {
	getAllCoachTeams,
	getCoachTeam,
	getCoachTeamBasic,
	getCoachTeamsFaceted,
	getCoachTeamsWithFaceted,
	getCoachTeamsWithFilters,
} from "@/features/coach-teams/actions/getcoach-teams";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SortingState } from "@tanstack/react-table";

// Query keys
export const coachTeamQueries = {
	all: ["coach-teams"] as const,
	lists: () => [...coachTeamQueries.all, "list"] as const,
	list: (filters: Record<string, unknown>) =>
		[...coachTeamQueries.lists(), filters] as const,
	tableData: (
		filters: FiltersState,
		page: number,
		pageSize: number,
		sorting: SortingState,
	) =>
		[
			...coachTeamQueries.lists(),
			"table",
			filters,
			page,
			pageSize,
			sorting,
		] as const,
	tableDataWithFaceted: (
		filters: FiltersState,
		page: number,
		pageSize: number,
		sorting: SortingState,
		facetedColumns: string[],
	) =>
		[
			...coachTeamQueries.lists(),
			"tableWithFaceted",
			filters,
			page,
			pageSize,
			sorting,
			facetedColumns,
		] as const,
	faceted: (columnId: string, filters: FiltersState) =>
		[...coachTeamQueries.lists(), "faceted", columnId, filters] as const,
	details: () => [...coachTeamQueries.all, "detail"] as const,
	detail: (id: string) => [...coachTeamQueries.details(), id] as const,
	basic: (id: string) => [...coachTeamQueries.all, "basic", id] as const,
};

// Query hooks
export function useCoachTeams() {
	return useQuery({
		queryKey: coachTeamQueries.lists(),
		queryFn: getAllCoachTeams,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Enhanced hook for table data with filtering, pagination, sorting
export function useCoachTeamsTableData(
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
) {
	return useQuery({
		queryKey: coachTeamQueries.tableData(filters, page, pageSize, sorting),
		queryFn: () => getCoachTeamsWithFilters(filters, page, pageSize, sorting),
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

// Faceted data query for filters
export function useCoachTeamsFaceted(
	columnId: string,
	filters: FiltersState = [],
) {
	return useQuery({
		queryKey: coachTeamQueries.faceted(columnId, filters),
		queryFn: () => getCoachTeamsFaceted(columnId, filters),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Combined hook for table data with faceted data - optimized single call
export function useCoachTeamsWithFaceted(
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
	facetedColumns: string[] = [],
) {
	return useQuery({
		queryKey: coachTeamQueries.tableDataWithFaceted(
			filters,
			page,
			pageSize,
			sorting,
			facetedColumns,
		),
		queryFn: () =>
			getCoachTeamsWithFaceted(
				filters,
				page,
				pageSize,
				sorting,
				facetedColumns,
			),
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

export function useCoachTeam(id: string) {
	return useQuery({
		queryKey: coachTeamQueries.detail(id),
		queryFn: () => getCoachTeam(id),
		enabled: !!id,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

export function useCoachTeamBasic(id: string) {
	return useQuery({
		queryKey: coachTeamQueries.basic(id),
		queryFn: () => getCoachTeamBasic(id),
		enabled: !!id,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

// Mutation hooks - placeholders for now
export function useCreateCoachTeam() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: any) => {
			// Placeholder implementation
			throw new Error("Create coach team not implemented");
		},
		onSuccess: () => {
			// Invalidate and refetch coach teams list
			queryClient.invalidateQueries({ queryKey: coachTeamQueries.lists() });
		},
	});
}

export function useUpdateCoachTeam() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: any) => {
			// Placeholder implementation
			throw new Error("Update coach team not implemented");
		},
		onSuccess: (result, variables) => {
			// Invalidate and refetch both the list and the specific coach team
			queryClient.invalidateQueries({ queryKey: coachTeamQueries.lists() });
			queryClient.invalidateQueries({
				queryKey: coachTeamQueries.detail(variables.id),
			});
			queryClient.invalidateQueries({
				queryKey: coachTeamQueries.basic(variables.id),
			});
		},
	});
}

export function useDeleteCoachTeam() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => {
			// Placeholder implementation
			throw new Error("Delete coach team not implemented");
		},
		onSuccess: (result, deletedId) => {
			// Remove the deleted coach team from the cache
			queryClient.removeQueries({
				queryKey: coachTeamQueries.detail(deletedId),
			});
			queryClient.removeQueries({
				queryKey: coachTeamQueries.basic(deletedId),
			});

			// Invalidate the coach teams list to refetch
			queryClient.invalidateQueries({ queryKey: coachTeamQueries.lists() });
		},
	});
}

// Prefetch helpers
export function prefetchCoachTeams(
	queryClient: ReturnType<typeof useQueryClient>,
) {
	return queryClient.prefetchQuery({
		queryKey: coachTeamQueries.lists(),
		queryFn: getAllCoachTeams,
		staleTime: 5 * 60 * 1000,
	});
}

export function prefetchCoachTeam(
	queryClient: ReturnType<typeof useQueryClient>,
	id: string,
) {
	return queryClient.prefetchQuery({
		queryKey: coachTeamQueries.detail(id),
		queryFn: () => getCoachTeam(id),
		staleTime: 2 * 60 * 1000,
	});
}

export function prefetchCoachTeamBasic(
	queryClient: ReturnType<typeof useQueryClient>,
	id: string,
) {
	return queryClient.prefetchQuery({
		queryKey: coachTeamQueries.basic(id),
		queryFn: () => getCoachTeamBasic(id),
		staleTime: 2 * 60 * 1000,
	});
}

// Prefetch helpers for new table data approach
export function prefetchCoachTeamsTableData(
	queryClient: ReturnType<typeof useQueryClient>,
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
) {
	return queryClient.prefetchQuery({
		queryKey: coachTeamQueries.tableData(filters, page, pageSize, sorting),
		queryFn: () => getCoachTeamsWithFilters(filters, page, pageSize, sorting),
		staleTime: 2 * 60 * 1000,
	});
}

export function prefetchCoachTeamsFaceted(
	queryClient: ReturnType<typeof useQueryClient>,
	columnId: string,
	filters: FiltersState = [],
) {
	return queryClient.prefetchQuery({
		queryKey: coachTeamQueries.faceted(columnId, filters),
		queryFn: () => getCoachTeamsFaceted(columnId, filters),
		staleTime: 5 * 60 * 1000,
	});
}
