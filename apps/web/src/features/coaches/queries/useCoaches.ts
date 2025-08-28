"use client";

import {
	getActiveCoaches,
	getAllCoaches,
	getCoachesWithFaceted,
} from "@/features/coaches/actions/getCoaches";
import { getCoach } from "@/features/coaches/actions/get-coach";

import {
	type QueryClient,
	useQuery,
	type useQueryClient,
} from "@tanstack/react-query";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";

// Query keys
export const coachQueries = {
	all: ["coaches"] as const,
	lists: () => [...coachQueries.all, "list"] as const,
	active: () => [...coachQueries.lists(), "active"] as const,
	detail: (id: string) => [...coachQueries.all, "detail", id] as const,
	tableWithFaceted: (
		filters: ColumnFiltersState,
		page: number,
		pageSize: number,
		sorting: SortingState,
		facetedColumns: string[],
	) =>
		[
			...coachQueries.lists(),
			"tableWithFaceted",
			filters,
			page,
			pageSize,
			sorting,
			facetedColumns,
		] as const,
	faceted: (columnId: string, filters: ColumnFiltersState) =>
		[...coachQueries.lists(), "faceted", columnId, filters] as const,
};

// Hook for coaches with faceted filtering
export function useCoachesWithFaceted(
	filters: ColumnFiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
	facetedColumns: string[] = ["contract_type"],
) {
	return useQuery({
		queryKey: coachQueries.tableWithFaceted(
			filters,
			page,
			pageSize,
			sorting,
			facetedColumns,
		),
		queryFn: () =>
			getCoachesWithFaceted(filters, page, pageSize, sorting, facetedColumns),
		staleTime: 2 * 60 * 1000,
	});
}

export function useCoaches() {
	return useQuery({
		queryKey: coachQueries.lists(),
		queryFn: getAllCoaches,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

export function useActiveCoaches() {
	return useQuery({
		queryKey: coachQueries.active(),
		queryFn: getActiveCoaches,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

export function useCoach(id: string) {
	return useQuery({
		queryKey: coachQueries.detail(id),
		queryFn: () => getCoach(id),
		staleTime: 5 * 60 * 1000, // 5 minutes
		enabled: !!id,
	});
}

// Prefetch helpers
export function prefetchCoaches(
	queryClient: ReturnType<typeof useQueryClient>,
) {
	return queryClient.prefetchQuery({
		queryKey: coachQueries.lists(),
		queryFn: getAllCoaches,
		staleTime: 5 * 60 * 1000,
	});
}

export function prefetchActiveCoaches(
	queryClient: ReturnType<typeof useQueryClient>,
) {
	return queryClient.prefetchQuery({
		queryKey: coachQueries.active(),
		queryFn: getActiveCoaches,
		staleTime: 5 * 60 * 1000,
	});
}
