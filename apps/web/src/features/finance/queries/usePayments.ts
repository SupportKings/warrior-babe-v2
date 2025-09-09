"use client";

import { createPayment } from "@/features/finance/actions/createPayment";
import { deletePayment } from "@/features/finance/actions/deletePayment";
import {
	getAllPayments,
	getClientsForFilter,
	getPayment,
	getPaymentsWithFaceted,
	getProductsForFilter,
	searchClientsForFilter,
} from "@/features/finance/actions/getPayments";
import { updatePayment } from "@/features/finance/actions/updatePayment";

import {
	type QueryClient,
	type UseQueryResult,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { toast } from "sonner";

// Query keys
export const paymentQueries = {
	all: ["payments"] as const,
	lists: () => [...paymentQueries.all, "list"] as const,
	detail: (id: string) => [...paymentQueries.all, "detail", id] as const,
	clients: () => [...paymentQueries.all, "clients-filter"] as const,
	products: () => [...paymentQueries.all, "products-filter"] as const,
	tableWithFaceted: (
		filters: ColumnFiltersState,
		page: number,
		pageSize: number,
		sorting: SortingState,
		facetedColumns: string[],
	) =>
		[
			...paymentQueries.lists(),
			"tableWithFaceted",
			filters,
			page,
			pageSize,
			sorting,
			facetedColumns,
		] as const,
};

// Hook for payments with filtering and faceted data in single query
export function usePaymentsWithFaceted(
	filters: ColumnFiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
	facetedColumns: string[] = ["status", "disputed_status", "platform"],
) {
	return useQuery({
		queryKey: paymentQueries.tableWithFaceted(
			filters,
			page,
			pageSize,
			sorting,
			facetedColumns,
		),
		queryFn: () =>
			getPaymentsWithFaceted(filters, page, pageSize, sorting, facetedColumns),
		staleTime: 2 * 60 * 1000,
	});
}

// Basic hooks
export function usePayments() {
	return useQuery({
		queryKey: paymentQueries.lists(),
		queryFn: getAllPayments,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

export function usePayment(id: string) {
	return useQuery({
		queryKey: paymentQueries.detail(id),
		queryFn: () => getPayment(id),
		staleTime: 5 * 60 * 1000, // 5 minutes
		enabled: !!id,
	});
}

// Filter data hooks
export function useClientsForFilter() {
	return useQuery({
		queryKey: paymentQueries.clients(),
		queryFn: getClientsForFilter,
		staleTime: 10 * 60 * 1000, // 10 minutes
	});
}

export function useSearchClientsForFilter(searchTerm: string) {
	return useQuery({
		queryKey: [...paymentQueries.clients(), "search", searchTerm],
		queryFn: () => searchClientsForFilter(searchTerm),
		staleTime: 5 * 60 * 1000, // 5 minutes
		enabled: searchTerm.length > 0, // Only search when there's a term
	});
}

export function useProductsForFilter() {
	return useQuery({
		queryKey: paymentQueries.products(),
		queryFn: getProductsForFilter,
		staleTime: 10 * 60 * 1000, // 10 minutes
	});
}

// Mutation hooks
export function useCreatePayment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createPayment,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: paymentQueries.all });
			toast.success("Payment created successfully");
		},
		onError: (error: Error) => {
			toast.error(`Failed to create payment: ${error.message}`);
		},
	});
}

export function useUpdatePayment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updatePayment,
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: paymentQueries.all });
			queryClient.invalidateQueries({
				queryKey: paymentQueries.detail(variables.id),
			});
			toast.success("Payment updated successfully");
		},
		onError: (error: Error) => {
			toast.error(`Failed to update payment: ${error.message}`);
		},
	});
}

export function useDeletePayment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deletePayment,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: paymentQueries.all });
			toast.success("Payment deleted successfully");
		},
		onError: (error: Error) => {
			toast.error(`Failed to delete payment: ${error.message}`);
		},
	});
}

// Prefetch helpers
export function prefetchPayments(queryClient: QueryClient) {
	return queryClient.prefetchQuery({
		queryKey: paymentQueries.lists(),
		queryFn: getAllPayments,
		staleTime: 5 * 60 * 1000,
	});
}

export function prefetchPaymentsWithFaceted(
	queryClient: QueryClient,
	filters: ColumnFiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
	facetedColumns: string[] = ["status", "disputed_status", "platform"],
) {
	return queryClient.prefetchQuery({
		queryKey: paymentQueries.tableWithFaceted(
			filters,
			page,
			pageSize,
			sorting,
			facetedColumns,
		),
		queryFn: () =>
			getPaymentsWithFaceted(filters, page, pageSize, sorting, facetedColumns),
		staleTime: 2 * 60 * 1000,
	});
}
