"use client";

import {
	getActiveCoaches,
	getAllCoaches,
	getCoaches,
} from "@/features/coaches/actions/getCoaches";
import { getCoach } from "@/features/coaches/actions/get-coach";
import { getAllPotentialTeamLeaders } from "@/features/coaches/actions/get-coach-teams";

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
	teamLeaders: () => [...coachQueries.all, "teamLeaders"] as const,
	table: (
		filters: ColumnFiltersState,
		page: number,
		pageSize: number,
		sorting: SortingState,
	) =>
		[
			...coachQueries.lists(),
			"table",
			filters,
			page,
			pageSize,
			sorting,
		] as const,
};

// Hook for coaches with filtering
export function useCoachesTable(
	filters: ColumnFiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
) {
	return useQuery({
		queryKey: coachQueries.table(
			filters,
			page,
			pageSize,
			sorting,
		),
		queryFn: () =>
			getCoaches(filters, page, pageSize, sorting),
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

export function useTeamLeaders() {
	return useQuery({
		queryKey: coachQueries.teamLeaders(),
		queryFn: getAllPotentialTeamLeaders,
		staleTime: 5 * 60 * 1000, // 5 minutes
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
