"use client";

import type { FiltersState } from "@/components/data-table-filter/core/types";

import { createClientTestimonialAction } from "@/features/clients/actions/createClientTestimonial";
import { deleteClientTestimonial } from "@/features/clients/actions/deleteClientTestimonial";
import {
	getAllClientTestimonials,
	getClientTestimonial,
	getClientTestimonialBasic,
	getClientTestimonialsFaceted,
	getClientTestimonialsWithFaceted,
	getClientTestimonialsWithFilters,
} from "@/features/clients/actions/getClientTestimonials";
import { updateClientTestimonialAction } from "@/features/clients/actions/updateClientTestimonial";
import type {
	ClientTestimonialEditFormInput,
	ClientTestimonialFormInput,
} from "@/features/clients/types/client-testimonial";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SortingState } from "@tanstack/react-table";

// Query keys
export const clientTestimonialQueries = {
	all: ["clientTestimonials"] as const,
	lists: () => [...clientTestimonialQueries.all, "list"] as const,
	list: (filters: Record<string, unknown>) =>
		[...clientTestimonialQueries.lists(), filters] as const,
	tableData: (
		filters: FiltersState,
		page: number,
		pageSize: number,
		sorting: SortingState,
	) =>
		[
			...clientTestimonialQueries.lists(),
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
			...clientTestimonialQueries.lists(),
			"tableWithFaceted",
			filters,
			page,
			pageSize,
			sorting,
			facetedColumns,
		] as const,
	faceted: (columnId: string, filters: FiltersState) =>
		[
			...clientTestimonialQueries.lists(),
			"faceted",
			columnId,
			filters,
		] as const,
	details: () => [...clientTestimonialQueries.all, "detail"] as const,
	detail: (id: string) => [...clientTestimonialQueries.details(), id] as const,
	basic: (id: string) =>
		[...clientTestimonialQueries.all, "basic", id] as const,
};

// Query hooks
export function useClientTestimonials() {
	return useQuery({
		queryKey: clientTestimonialQueries.lists(),
		queryFn: getAllClientTestimonials,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Enhanced hook for table data with filtering, pagination, sorting
export function useClientTestimonialsTableData(
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
) {
	return useQuery({
		queryKey: clientTestimonialQueries.tableData(
			filters,
			page,
			pageSize,
			sorting,
		),
		queryFn: () =>
			getClientTestimonialsWithFilters(filters, page, pageSize, sorting),
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

// Faceted data query for filters
export function useClientTestimonialsFaceted(
	columnId: string,
	filters: FiltersState = [],
) {
	return useQuery({
		queryKey: clientTestimonialQueries.faceted(columnId, filters),
		queryFn: () => getClientTestimonialsFaceted(columnId, filters),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Combined hook for table data with faceted data - optimized single call
export function useClientTestimonialsWithFaceted(
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
	facetedColumns: string[] = ["testimonial_type"],
) {
	return useQuery({
		queryKey: clientTestimonialQueries.tableDataWithFaceted(
			filters,
			page,
			pageSize,
			sorting,
			facetedColumns,
		),
		queryFn: () =>
			getClientTestimonialsWithFaceted(
				filters,
				page,
				pageSize,
				sorting,
				facetedColumns,
			),
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

export function useClientTestimonial(id: string) {
	return useQuery({
		queryKey: clientTestimonialQueries.detail(id),
		queryFn: () => getClientTestimonial(id),
		enabled: !!id,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

export function useClientTestimonialBasic(id: string) {
	return useQuery({
		queryKey: clientTestimonialQueries.basic(id),
		queryFn: () => getClientTestimonialBasic(id),
		enabled: !!id,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

// Mutation hooks
export function useCreateClientTestimonial() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: ClientTestimonialFormInput) =>
			createClientTestimonialAction(data),
		onSuccess: () => {
			// Invalidate and refetch client testimonials list
			queryClient.invalidateQueries({
				queryKey: clientTestimonialQueries.lists(),
			});
		},
	});
}

export function useUpdateClientTestimonial() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: ClientTestimonialEditFormInput) =>
			updateClientTestimonialAction(data),
		onSuccess: (result, variables) => {
			// Invalidate and refetch both the list and the specific testimonial
			queryClient.invalidateQueries({
				queryKey: clientTestimonialQueries.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: clientTestimonialQueries.detail(variables.id),
			});
			queryClient.invalidateQueries({
				queryKey: clientTestimonialQueries.basic(variables.id),
			});
		},
	});
}

export function useDeleteClientTestimonial() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteClientTestimonial({ id }),
		onSuccess: (result, deletedId) => {
			// Remove the deleted testimonial from the cache
			queryClient.removeQueries({
				queryKey: clientTestimonialQueries.detail(deletedId),
			});
			queryClient.removeQueries({
				queryKey: clientTestimonialQueries.basic(deletedId),
			});

			// Invalidate the testimonials list to refetch
			queryClient.invalidateQueries({
				queryKey: clientTestimonialQueries.lists(),
			});
		},
	});
}

// Prefetch helpers
export function prefetchClientTestimonials(
	queryClient: ReturnType<typeof useQueryClient>,
) {
	return queryClient.prefetchQuery({
		queryKey: clientTestimonialQueries.lists(),
		queryFn: getAllClientTestimonials,
		staleTime: 5 * 60 * 1000,
	});
}
