"use client";

import type { FiltersState } from "@/components/data-table-filter/core/types";

import { createCoachPaymentAction } from "@/features/finance/actions/createCoachPayment";
import { deleteCoachPayment } from "@/features/finance/actions/deleteCoachPayment";
import {
	getAllCoachPayments,
	getCoachPayment,
	getCoachPaymentBasic,
	getCoachPaymentsFaceted,
	getCoachPaymentsWithFaceted,
	getCoachPaymentsWithFilters,
} from "@/features/finance/actions/getCoachPayments";
import { updateCoachPaymentAction } from "@/features/finance/actions/updateCoachPayment";
import type {
	CoachPaymentEditFormInput,
	CoachPaymentFormInput,
} from "@/features/finance/types/coach-payment";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SortingState } from "@tanstack/react-table";

// Query keys
export const coachPaymentQueries = {
	all: ["coachPayments"] as const,
	lists: () => [...coachPaymentQueries.all, "list"] as const,
	list: (filters: Record<string, unknown>) =>
		[...coachPaymentQueries.lists(), filters] as const,
	tableData: (
		filters: FiltersState,
		page: number,
		pageSize: number,
		sorting: SortingState,
	) =>
		[
			...coachPaymentQueries.lists(),
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
			...coachPaymentQueries.lists(),
			"tableWithFaceted",
			filters,
			page,
			pageSize,
			sorting,
			facetedColumns,
		] as const,
	faceted: (columnId: string, filters: FiltersState) =>
		[...coachPaymentQueries.lists(), "faceted", columnId, filters] as const,
	details: () => [...coachPaymentQueries.all, "detail"] as const,
	detail: (id: string) => [...coachPaymentQueries.details(), id] as const,
	basic: (id: string) => [...coachPaymentQueries.all, "basic", id] as const,
};

// Query hooks
export function useCoachPayments() {
	return useQuery({
		queryKey: coachPaymentQueries.lists(),
		queryFn: getAllCoachPayments,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Enhanced hook for table data with filtering, pagination, sorting
export function useCoachPaymentsTableData(
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
) {
	return useQuery({
		queryKey: coachPaymentQueries.tableData(filters, page, pageSize, sorting),
		queryFn: () => getCoachPaymentsWithFilters(filters, page, pageSize, sorting),
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

// Faceted data query for filters
export function useCoachPaymentsFaceted(
	columnId: string,
	filters: FiltersState = [],
) {
	return useQuery({
		queryKey: coachPaymentQueries.faceted(columnId, filters),
		queryFn: () => getCoachPaymentsFaceted(columnId, filters),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Combined hook for table data with faceted data - optimized single call
export function useCoachPaymentsWithFaceted(
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
	facetedColumns: string[] = ["status"],
) {
	return useQuery({
		queryKey: coachPaymentQueries.tableDataWithFaceted(
			filters,
			page,
			pageSize,
			sorting,
			facetedColumns,
		),
		queryFn: () =>
			getCoachPaymentsWithFaceted(filters, page, pageSize, sorting, facetedColumns),
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

export function useCoachPayment(id: string) {
	return useQuery({
		queryKey: coachPaymentQueries.detail(id),
		queryFn: () => getCoachPayment(id),
		enabled: !!id,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

export function useCoachPaymentBasic(id: string) {
	return useQuery({
		queryKey: coachPaymentQueries.basic(id),
		queryFn: () => getCoachPaymentBasic(id),
		enabled: !!id,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

// Mutation hooks
export function useCreateCoachPayment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CoachPaymentFormInput) => createCoachPaymentAction(data),
		onSuccess: () => {
			// Invalidate and refetch coach payments list
			queryClient.invalidateQueries({ queryKey: coachPaymentQueries.lists() });
		},
	});
}

export function useUpdateCoachPayment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CoachPaymentEditFormInput) => updateCoachPaymentAction(data),
		onSuccess: (result, variables) => {
			// Invalidate and refetch both the list and the specific coach payment
			queryClient.invalidateQueries({ queryKey: coachPaymentQueries.lists() });
			queryClient.invalidateQueries({
				queryKey: coachPaymentQueries.detail(variables.id),
			});
			queryClient.invalidateQueries({
				queryKey: coachPaymentQueries.basic(variables.id),
			});
		},
	});
}

export function useDeleteCoachPayment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteCoachPayment({ id }),
		onSuccess: (result, deletedId) => {
			// Remove the deleted coach payment from the cache
			queryClient.removeQueries({ queryKey: coachPaymentQueries.detail(deletedId) });
			queryClient.removeQueries({ queryKey: coachPaymentQueries.basic(deletedId) });

			// Invalidate the coach payments list to refetch
			queryClient.invalidateQueries({ queryKey: coachPaymentQueries.lists() });
		},
	});
}

// Prefetch helpers
export function prefetchCoachPayments(
	queryClient: ReturnType<typeof useQueryClient>,
) {
	return queryClient.prefetchQuery({
		queryKey: coachPaymentQueries.lists(),
		queryFn: getAllCoachPayments,
		staleTime: 5 * 60 * 1000,
	});
}