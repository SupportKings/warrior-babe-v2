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

/**
 * Fetches the list of active coaches and caches the result.
 *
 * Uses React Query with the `coachQueries.active()` key and `getActiveCoaches` as the fetcher.
 * The cached data is considered fresh for 5 minutes.
 *
 * @returns The React Query result for the active coaches query.
 */
export function useActiveCoaches() {
	return useQuery({
		queryKey: coachQueries.active(),
		queryFn: getActiveCoaches,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Fetches a single coach by ID using React Query.
 *
 * The query is only active when `id` is truthy and is cached as stale for 5 minutes.
 *
 * @param id - The coach's unique identifier. If falsy, the query will be disabled.
 * @returns The React Query result for the coach fetch (status, data, error, etc.).
 */
export function useCoach(id: string) {
	return useQuery({
		queryKey: coachQueries.detail(id),
		queryFn: () => getCoach(id),
		staleTime: 5 * 60 * 1000, // 5 minutes
		enabled: !!id,
	});
}

/**
 * Prefetches the full coaches list into the React Query cache using the `lists` key.
 *
 * The prefetched data is considered fresh for 5 minutes (staleTime = 5 minutes).
 *
 * @returns A promise that resolves when the prefetch completes.
 */
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
