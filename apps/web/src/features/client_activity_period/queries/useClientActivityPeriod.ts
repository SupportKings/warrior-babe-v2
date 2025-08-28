"use client";

import type { FiltersState } from "@/components/data-table-filter/core/types";

import { createClientActivityPeriodAction } from "@/features/client_activity_period/actions/createClientActivityPeriod";
import { deleteClientActivityPeriod } from "@/features/client_activity_period/actions/deleteClientActivityPeriod";
import {
	getAllClientActivityPeriods,
	getClientActivityPeriod,
	getClientActivityPeriodBasic,
	getClientActivityPeriodsFaceted,
	getClientActivityPeriodsWithFaceted,
	getClientActivityPeriodsWithFilters,
} from "@/features/client_activity_period/actions/getClientActivityPeriod";
import { updateClientActivityPeriodAction } from "@/features/client_activity_period/actions/updateClientActivityPeriod";
import type {
	ClientActivityPeriodEditFormInput,
	ClientActivityPeriodFormInput,
} from "@/features/client_activity_period/types/clientActivityPeriod";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SortingState } from "@tanstack/react-table";

// Query keys
export const clientActivityPeriodQueries = {
	all: ["client_activity_periods"] as const,
	lists: () => [...clientActivityPeriodQueries.all, "list"] as const,
	list: (filters: Record<string, unknown>) =>
		[...clientActivityPeriodQueries.lists(), filters] as const,
	tableData: (
		filters: FiltersState,
		page: number,
		pageSize: number,
		sorting: SortingState,
	) =>
		[
			...clientActivityPeriodQueries.lists(),
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
			...clientActivityPeriodQueries.lists(),
			"tableWithFaceted",
			filters,
			page,
			pageSize,
			sorting,
			facetedColumns,
		] as const,
	faceted: (columnId: string, filters: FiltersState) =>
		[
			...clientActivityPeriodQueries.lists(),
			"faceted",
			columnId,
			filters,
		] as const,
	details: () => [...clientActivityPeriodQueries.all, "detail"] as const,
	detail: (id: string) =>
		[...clientActivityPeriodQueries.details(), id] as const,
	basic: (id: string) =>
		[...clientActivityPeriodQueries.all, "basic", id] as const,
};

// Query hooks
export function useClientActivityPeriods() {
	return useQuery({
		queryKey: clientActivityPeriodQueries.lists(),
		queryFn: getAllClientActivityPeriods,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Enhanced hook for table data with filtering, pagination, sorting
export function useClientActivityPeriodsTableData(
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
) {
	return useQuery({
		queryKey: clientActivityPeriodQueries.tableData(
			filters,
			page,
			pageSize,
			sorting,
		),
		queryFn: () =>
			getClientActivityPeriodsWithFilters(filters, page, pageSize, sorting),
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

// Faceted data query for filters
export function useClientActivityPeriodsFaceted(
	columnId: string,
	filters: FiltersState = [],
) {
	return useQuery({
		queryKey: clientActivityPeriodQueries.faceted(columnId, filters),
		queryFn: () => getClientActivityPeriodsFaceted(columnId, filters),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Combined hook for table data with faceted data - optimized single call
export function useClientActivityPeriodsWithFaceted(
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
	facetedColumns: string[] = [],
) {
	return useQuery({
		queryKey: clientActivityPeriodQueries.tableDataWithFaceted(
			filters,
			page,
			pageSize,
			sorting,
			facetedColumns,
		),
		queryFn: () =>
			getClientActivityPeriodsWithFaceted(
				filters,
				page,
				pageSize,
				sorting,
				facetedColumns,
			),
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

export function useClientActivityPeriod(id: string) {
	return useQuery({
		queryKey: clientActivityPeriodQueries.detail(id),
		queryFn: () => getClientActivityPeriod(id),
		enabled: !!id,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

export function useClientActivityPeriodBasic(id: string) {
	return useQuery({
		queryKey: clientActivityPeriodQueries.basic(id),
		queryFn: () => getClientActivityPeriodBasic(id),
		enabled: !!id,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

// Mutation hooks
export function useCreateClientActivityPeriod() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: ClientActivityPeriodFormInput) =>
			createClientActivityPeriodAction(data),
		onSuccess: () => {
			// Invalidate and refetch client activity periods list
			queryClient.invalidateQueries({
				queryKey: clientActivityPeriodQueries.lists(),
			});
		},
	});
}

export function useUpdateClientActivityPeriod() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: ClientActivityPeriodEditFormInput) =>
			updateClientActivityPeriodAction(data),
		onSuccess: (result, variables) => {
			// Invalidate and refetch both the list and the specific client activity period
			queryClient.invalidateQueries({
				queryKey: clientActivityPeriodQueries.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: clientActivityPeriodQueries.detail(variables.id),
			});
			queryClient.invalidateQueries({
				queryKey: clientActivityPeriodQueries.basic(variables.id),
			});
		},
	});
}

export function useDeleteClientActivityPeriod() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteClientActivityPeriod({ id }),
		onSuccess: (result, deletedId) => {
			// Remove the deleted client activity period from the cache
			queryClient.removeQueries({
				queryKey: clientActivityPeriodQueries.detail(deletedId),
			});
			queryClient.removeQueries({
				queryKey: clientActivityPeriodQueries.basic(deletedId),
			});

			// Invalidate the client activity periods list to refetch
			queryClient.invalidateQueries({
				queryKey: clientActivityPeriodQueries.lists(),
			});
		},
	});
}

// Prefetch helpers
export function prefetchClientActivityPeriods(
	queryClient: ReturnType<typeof useQueryClient>,
) {
	return queryClient.prefetchQuery({
		queryKey: clientActivityPeriodQueries.lists(),
		queryFn: getAllClientActivityPeriods,
		staleTime: 5 * 60 * 1000,
	});
}

export function prefetchClientActivityPeriod(
	queryClient: ReturnType<typeof useQueryClient>,
	id: string,
) {
	return queryClient.prefetchQuery({
		queryKey: clientActivityPeriodQueries.detail(id),
		queryFn: () => getClientActivityPeriod(id),
		staleTime: 2 * 60 * 1000,
	});
}

export function prefetchClientActivityPeriodBasic(
	queryClient: ReturnType<typeof useQueryClient>,
	id: string,
) {
	return queryClient.prefetchQuery({
		queryKey: clientActivityPeriodQueries.basic(id),
		queryFn: () => getClientActivityPeriodBasic(id),
		staleTime: 2 * 60 * 1000,
	});
}

// Prefetch helpers for new table data approach
export function prefetchClientActivityPeriodsTableData(
	queryClient: ReturnType<typeof useQueryClient>,
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
) {
	return queryClient.prefetchQuery({
		queryKey: clientActivityPeriodQueries.tableData(
			filters,
			page,
			pageSize,
			sorting,
		),
		queryFn: () =>
			getClientActivityPeriodsWithFilters(filters, page, pageSize, sorting),
		staleTime: 2 * 60 * 1000,
	});
}

export function prefetchClientActivityPeriodsFaceted(
	queryClient: ReturnType<typeof useQueryClient>,
	columnId: string,
	filters: FiltersState = [],
) {
	return queryClient.prefetchQuery({
		queryKey: clientActivityPeriodQueries.faceted(columnId, filters),
		queryFn: () => getClientActivityPeriodsFaceted(columnId, filters),
		staleTime: 5 * 60 * 1000,
	});
}
