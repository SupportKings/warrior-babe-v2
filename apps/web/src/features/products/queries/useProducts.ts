"use client";

import type { FiltersState } from "@/components/data-table-filter/core/types";

import {
	getAllProducts,
	getProduct,
	getProductBasic,
	getProductsFaceted,
	getProductsWithFaceted,
	getProductsWithFilters,
} from "@/features/products/actions/getProducts";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SortingState } from "@tanstack/react-table";

// Query keys
export const productQueries = {
	all: ["products"] as const,
	lists: () => [...productQueries.all, "list"] as const,
	list: (filters: Record<string, unknown>) =>
		[...productQueries.lists(), filters] as const,
	tableData: (
		filters: FiltersState,
		page: number,
		pageSize: number,
		sorting: SortingState,
	) =>
		[
			...productQueries.lists(),
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
			...productQueries.lists(),
			"tableWithFaceted",
			filters,
			page,
			pageSize,
			sorting,
			facetedColumns,
		] as const,
	faceted: (columnId: string, filters: FiltersState) =>
		[...productQueries.lists(), "faceted", columnId, filters] as const,
	details: () => [...productQueries.all, "detail"] as const,
	detail: (id: string) => [...productQueries.details(), id] as const,
	basic: (id: string) => [...productQueries.all, "basic", id] as const,
};

// Query hooks
export function useProducts() {
	return useQuery({
		queryKey: productQueries.lists(),
		queryFn: getAllProducts,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Enhanced hook for table data with filtering, pagination, sorting
export function useProductsTableData(
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
) {
	return useQuery({
		queryKey: productQueries.tableData(filters, page, pageSize, sorting),
		queryFn: () => getProductsWithFilters(filters, page, pageSize, sorting),
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

// Faceted data query for filters
export function useProductsFaceted(
	columnId: string,
	filters: FiltersState = [],
) {
	return useQuery({
		queryKey: productQueries.faceted(columnId, filters),
		queryFn: () => getProductsFaceted(columnId, filters),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Combined hook for table data with faceted data - optimized single call
export function useProductsWithFaceted(
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
	facetedColumns: string[] = ["is_active"],
) {
	return useQuery({
		queryKey: productQueries.tableDataWithFaceted(
			filters,
			page,
			pageSize,
			sorting,
			facetedColumns,
		),
		queryFn: () =>
			getProductsWithFaceted(filters, page, pageSize, sorting, facetedColumns),
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

export function useProduct(id: string) {
	return useQuery({
		queryKey: productQueries.detail(id),
		queryFn: () => getProduct(id),
		enabled: !!id,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

export function useProductBasic(id: string) {
	return useQuery({
		queryKey: productQueries.basic(id),
		queryFn: () => getProductBasic(id),
		enabled: !!id,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

// Mutation hooks (placeholders for future implementation)
export function useCreateProduct() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: any) => {
			throw new Error("Create product functionality not implemented yet");
		},
		onSuccess: () => {
			// Invalidate and refetch products list
			queryClient.invalidateQueries({ queryKey: productQueries.lists() });
		},
	});
}

export function useUpdateProduct() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: any) => {
			throw new Error("Update product functionality not implemented yet");
		},
		onSuccess: (result, variables: any) => {
			// Invalidate and refetch both the list and the specific product
			queryClient.invalidateQueries({ queryKey: productQueries.lists() });
			queryClient.invalidateQueries({
				queryKey: productQueries.detail(variables.id),
			});
			queryClient.invalidateQueries({
				queryKey: productQueries.basic(variables.id),
			});
		},
	});
}

export function useDeleteProduct() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			throw new Error("Delete product functionality not implemented yet");
		},
		onSuccess: (result, deletedId) => {
			// Remove the deleted product from the cache
			queryClient.removeQueries({ queryKey: productQueries.detail(deletedId) });
			queryClient.removeQueries({ queryKey: productQueries.basic(deletedId) });

			// Invalidate the products list to refetch
			queryClient.invalidateQueries({ queryKey: productQueries.lists() });
		},
	});
}

// Prefetch helpers
export function prefetchProducts(
	queryClient: ReturnType<typeof useQueryClient>,
) {
	return queryClient.prefetchQuery({
		queryKey: productQueries.lists(),
		queryFn: getAllProducts,
		staleTime: 5 * 60 * 1000,
	});
}

export function prefetchProduct(
	queryClient: ReturnType<typeof useQueryClient>,
	id: string,
) {
	return queryClient.prefetchQuery({
		queryKey: productQueries.detail(id),
		queryFn: () => getProduct(id),
		staleTime: 2 * 60 * 1000,
	});
}

export function prefetchProductBasic(
	queryClient: ReturnType<typeof useQueryClient>,
	id: string,
) {
	return queryClient.prefetchQuery({
		queryKey: productQueries.basic(id),
		queryFn: () => getProductBasic(id),
		staleTime: 2 * 60 * 1000,
	});
}

// Prefetch helpers for new table data approach
export function prefetchProductsTableData(
	queryClient: ReturnType<typeof useQueryClient>,
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
) {
	return queryClient.prefetchQuery({
		queryKey: productQueries.tableData(filters, page, pageSize, sorting),
		queryFn: () => getProductsWithFilters(filters, page, pageSize, sorting),
		staleTime: 2 * 60 * 1000,
	});
}

export function prefetchProductsFaceted(
	queryClient: ReturnType<typeof useQueryClient>,
	columnId: string,
	filters: FiltersState = [],
) {
	return queryClient.prefetchQuery({
		queryKey: productQueries.faceted(columnId, filters),
		queryFn: () => getProductsFaceted(columnId, filters),
		staleTime: 5 * 60 * 1000,
	});
}
