"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	deleteWinTag as deleteWinTagAction,
	getAllWinTags,
	getWinTag,
	getWinTagsWithFaceted,
	getWinTagsWithFilters,
} from "../actions/getWinTags";

// Query keys object with structured hierarchy
export const winTagsQueries = {
	all: ["win-tags"] as const,
	lists: () => [...winTagsQueries.all, "list"] as const,
	list: (filters?: any[], page?: number, pageSize?: number, sorting?: any[]) =>
		[...winTagsQueries.lists(), { filters, page, pageSize, sorting }] as const,
	allTags: () => [...winTagsQueries.all, "all-tags"] as const,
	faceted: (columnId: string, filters?: any[]) =>
		[...winTagsQueries.all, "faceted", columnId, { filters }] as const,
	detail: (id: string) => [...winTagsQueries.all, "detail", id] as const,
	tableDataWithFaceted: (
		filters?: any[],
		page?: number,
		pageSize?: number,
		sorting?: any[],
		facetedColumns?: string[],
	) =>
		[
			...winTagsQueries.all,
			"table-with-faceted",
			{ filters, page, pageSize, sorting, facetedColumns },
		] as const,
};

// Combined hook for table data with faceted filters
export function useWinTagsWithFaceted(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
	facetedColumns: string[] = ["color"],
) {
	return useQuery({
		queryKey: winTagsQueries.tableDataWithFaceted(
			filters,
			page,
			pageSize,
			sorting,
			facetedColumns,
		),
		queryFn: () =>
			getWinTagsWithFaceted(filters, page, pageSize, sorting, facetedColumns),
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

export function useWinTags(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
) {
	return useQuery({
		queryKey: winTagsQueries.list(filters, page, pageSize, sorting),
		queryFn: () => getWinTagsWithFilters(filters, page, pageSize, sorting),
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

export function useWinTag(id: string) {
	return useQuery({
		queryKey: winTagsQueries.detail(id),
		queryFn: () => getWinTag(id),
		enabled: !!id,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

export function useAllWinTags() {
	return useQuery({
		queryKey: winTagsQueries.allTags(),
		queryFn: () => getAllWinTags(),
		staleTime: 5 * 60 * 1000, // 5 minutes (longer cache for simple all tags query)
	});
}

// Mutation hooks
export function useDeleteWinTag() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteWinTagAction(id),
		onSuccess: () => {
			// Invalidate all win tags queries
			queryClient.invalidateQueries({
				queryKey: winTagsQueries.all,
			});
		},
		onError: (error) => {
			console.error("Error deleting win tag:", error);
			toast.error("Failed to delete win tag");
		},
	});
}

// Prefetch helper functions for server-side prefetching
export async function prefetchWinTagsTableData(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
) {
	return await getWinTagsWithFilters(filters, page, pageSize, sorting);
}

export async function prefetchWinTagsWithFaceted(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
	facetedColumns: string[] = ["color"],
) {
	return await getWinTagsWithFaceted(
		filters,
		page,
		pageSize,
		sorting,
		facetedColumns,
	);
}
