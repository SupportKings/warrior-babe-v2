import type { FiltersState } from "@/components/data-table-filter/core/types";

import type { SortingState } from "@tanstack/react-table";

/**
 * Centralized query key factory for clients feature
 * Ensures consistent query key patterns across all client-related queries
 */
export const clientQueryKeys = {
	// Base keys
	all: () => ["clients"] as const,
	lists: () => [...clientQueryKeys.all(), "list"] as const,
	details: () => [...clientQueryKeys.all(), "detail"] as const,

	// List queries
	list: (filters: Record<string, unknown>) =>
		[...clientQueryKeys.lists(), filters] as const,

	// Table data queries
	tableData: (
		filters: FiltersState,
		page: number,
		pageSize: number,
		sorting: SortingState,
	) =>
		[
			...clientQueryKeys.lists(),
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
			...clientQueryKeys.lists(),
			"tableWithFaceted",
			filters,
			page,
			pageSize,
			sorting,
			facetedColumns,
		] as const,

	// Faceted data queries
	faceted: (columnId: string, filters: FiltersState) =>
		[...clientQueryKeys.lists(), "faceted", columnId, filters] as const,

	// Detail queries
	detail: (id: string) => [...clientQueryKeys.details(), id] as const,
	basic: (id: string) => [...clientQueryKeys.all(), "basic", id] as const,

	// Client relation queries - standardized pattern
	relations: (clientId: string) =>
		[...clientQueryKeys.detail(clientId), "relations"] as const,

	paymentPlans: (clientId: string) =>
		[...clientQueryKeys.relations(clientId), "payment_plans"] as const,

	assignedCoaches: (clientId: string) =>
		[...clientQueryKeys.relations(clientId), "assigned_coaches"] as const,

	goals: (clientId: string) =>
		[...clientQueryKeys.relations(clientId), "goals"] as const,

	wins: (clientId: string) =>
		[...clientQueryKeys.relations(clientId), "wins"] as const,

	activityPeriods: (clientId: string) =>
		[...clientQueryKeys.relations(clientId), "activity_periods"] as const,

	npsScores: (clientId: string) =>
		[...clientQueryKeys.relations(clientId), "nps_scores"] as const,

	testimonials: (clientId: string) =>
		[...clientQueryKeys.relations(clientId), "testimonials"] as const,
};

/**
 * Standard stale time configurations
 */
export const STALE_TIME = {
	SHORT: 2 * 60 * 1000, // 2 minutes
	MEDIUM: 5 * 60 * 1000, // 5 minutes
	LONG: 10 * 60 * 1000, // 10 minutes
} as const;
