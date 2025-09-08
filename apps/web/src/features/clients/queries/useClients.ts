"use client";

import type { FiltersState } from "@/components/data-table-filter/core/types";

import { createClientAction } from "@/features/clients/actions/createClient";
import { deleteClient } from "@/features/clients/actions/deleteClient";
import {
	getAllClients,
	getClient,
	getClientBasic,
	getClientsWithFaceted,
	getClientsWithFilters,
} from "@/features/clients/actions/getClient";
import { updateClientAction } from "@/features/clients/actions/updateClient";
import type {
	ClientEditFormInput,
	ClientFormInput,
} from "@/features/clients/types/client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SortingState } from "@tanstack/react-table";
import { clientQueryKeys, STALE_TIME } from "../utils/query-keys";

// Re-export for backward compatibility
export const clientQueries = clientQueryKeys;

// Query hooks
export function useClients() {
	return useQuery({
		queryKey: clientQueries.lists(),
		queryFn: getAllClients,
		staleTime: STALE_TIME.MEDIUM,
	});
}

// Enhanced hook for table data with filtering, pagination, sorting
export function useClientsTableData(
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
) {
	return useQuery({
		queryKey: clientQueries.tableData(filters, page, pageSize, sorting),
		queryFn: () => getClientsWithFilters(filters, page, pageSize, sorting),
		staleTime: STALE_TIME.SHORT,
	});
}


// Combined hook for table data with faceted data - optimized single call
export function useClientsWithFaceted(
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
	facetedColumns: string[] = ["overall_status"],
) {
	return useQuery({
		queryKey: clientQueries.tableDataWithFaceted(
			filters,
			page,
			pageSize,
			sorting,
			facetedColumns,
		),
		queryFn: () =>
			getClientsWithFaceted(filters, page, pageSize, sorting, facetedColumns),
		staleTime: STALE_TIME.SHORT,
	});
}

export function useClient(id: string) {
	return useQuery({
		queryKey: clientQueries.detail(id),
		queryFn: () => getClient(id),
		enabled: !!id,
		staleTime: STALE_TIME.SHORT,
	});
}

export function useClientBasic(id: string) {
	return useQuery({
		queryKey: clientQueries.basic(id),
		queryFn: () => getClientBasic(id),
		enabled: !!id,
		staleTime: STALE_TIME.SHORT,
	});
}

// Mutation hooks
export function useCreateClient() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: ClientFormInput) => createClientAction(data),
		onSuccess: () => {
			// Invalidate and refetch clients list
			queryClient.invalidateQueries({ queryKey: clientQueries.lists() });
		},
	});
}

export function useUpdateClient() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: ClientEditFormInput) => updateClientAction(data),
		onSuccess: (result, variables) => {
			// Invalidate and refetch both the list and the specific client
			queryClient.invalidateQueries({ queryKey: clientQueries.lists() });
			queryClient.invalidateQueries({
				queryKey: clientQueries.detail(variables.id),
			});
			queryClient.invalidateQueries({
				queryKey: clientQueries.basic(variables.id),
			});
		},
	});
}

export function useDeleteClient() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteClient({ id }),
		onSuccess: (result, deletedId) => {
			// Remove the deleted client from the cache
			queryClient.removeQueries({ queryKey: clientQueries.detail(deletedId) });
			queryClient.removeQueries({ queryKey: clientQueries.basic(deletedId) });

			// Invalidate the clients list to refetch
			queryClient.invalidateQueries({ queryKey: clientQueries.lists() });
		},
	});
}

// Prefetch helpers
export function prefetchClients(
	queryClient: ReturnType<typeof useQueryClient>,
) {
	return queryClient.prefetchQuery({
		queryKey: clientQueries.lists(),
		queryFn: getAllClients,
		staleTime: STALE_TIME.MEDIUM,
	});
}

export function prefetchClient(
	queryClient: ReturnType<typeof useQueryClient>,
	id: string,
) {
	return queryClient.prefetchQuery({
		queryKey: clientQueries.detail(id),
		queryFn: () => getClient(id),
		staleTime: STALE_TIME.SHORT,
	});
}

export function prefetchClientBasic(
	queryClient: ReturnType<typeof useQueryClient>,
	id: string,
) {
	return queryClient.prefetchQuery({
		queryKey: clientQueries.basic(id),
		queryFn: () => getClientBasic(id),
		staleTime: STALE_TIME.SHORT,
	});
}

// Prefetch helpers for new table data approach
export function prefetchClientsTableData(
	queryClient: ReturnType<typeof useQueryClient>,
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
) {
	return queryClient.prefetchQuery({
		queryKey: clientQueries.tableData(filters, page, pageSize, sorting),
		queryFn: () => getClientsWithFilters(filters, page, pageSize, sorting),
		staleTime: STALE_TIME.SHORT,
	});
}

