"use client";

import {
	getActiveCoaches,
	getAllCoaches,
} from "@/features/coaches/actions/getCoaches";

import { useQuery, type useQueryClient } from "@tanstack/react-query";

// Query keys
export const coachQueries = {
	all: ["coaches"] as const,
	lists: () => [...coachQueries.all, "list"] as const,
	active: () => [...coachQueries.lists(), "active"] as const,
};

// Query hooks
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
