/**
 * Reusable filter logic for client queries
 * Centralizes the filtering logic to avoid duplication
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type FilterOperator =
	| "is"
	| "is not"
	| "contains"
	| "does not contain"
	| "is any of"
	| "is none of"
	| "is before"
	| "is on or before"
	| "is after"
	| "is on or after"
	| "is between"
	| "is not between";

export interface Filter {
	columnId: string;
	operator: FilterOperator;
	values: string[];
}

/**
 * Applies a single filter to a Supabase query
 */
export function applyFilter(query: any, filter: Filter): any {
	if (!filter.values || filter.values.length === 0) return query;

	const { columnId, operator, values } = filter;

	switch (columnId) {
		case "name":
		case "email":
		case "phone":
			return applyTextFilter(query, columnId, operator, values);

		case "overall_status":
		case "everfit_access":
			return applyStatusFilter(query, columnId, operator, values);

		case "created_at":
		case "updated_at":
		case "onboarding_completed_date":
		case "offboard_date":
			return applyDateFilter(query, columnId, operator, values);

		case "onboarding_call_completed":
		case "two_week_check_in_call_completed":
		case "vip_terms_signed":
			return applyBooleanFilter(query, columnId, operator, values);

		default:
			return query;
	}
}

/**
 * Applies multiple filters to a Supabase query
 */
export function applyFilters(query: any, filters: Filter[]): any {
	return filters.reduce((q, filter) => applyFilter(q, filter), query);
}

function applyTextFilter(
	query: any,
	columnId: string,
	operator: FilterOperator,
	values: string[],
): any {
	switch (operator) {
		case "contains":
			return query.ilike(columnId, `%${values[0]}%`);
		case "does not contain":
			return query.not(columnId, "ilike", `%${values[0]}%`);
		case "is":
			return query.eq(columnId, values[0]);
		case "is not":
			return query.not(columnId, "eq", values[0]);
		default:
			return query;
	}
}

function applyStatusFilter(
	query: any,
	columnId: string,
	operator: FilterOperator,
	values: string[],
): any {
	switch (operator) {
		case "contains":
			return query.ilike(columnId, `%${values[0]}%`);
		case "does not contain":
			return query.not(columnId, "ilike", `%${values[0]}%`);
		case "is":
			return query.eq(columnId, values[0]);
		case "is not":
			return query.not(columnId, "eq", values[0]);
		case "is any of":
			return query.in(columnId, values);
		case "is none of":
			return query.not(columnId, "in", `(${values.join(",")})`);
		default:
			return query;
	}
}

function applyDateFilter(
	query: any,
	columnId: string,
	operator: FilterOperator,
	values: string[],
): any {
	switch (operator) {
		case "is":
			return query.eq(columnId, values[0]);
		case "is not":
			return query.not(columnId, "eq", values[0]);
		case "is before":
			return query.lt(columnId, values[0]);
		case "is on or before":
			return query.lte(columnId, values[0]);
		case "is after":
			return query.gt(columnId, values[0]);
		case "is on or after":
			return query.gte(columnId, values[0]);
		case "is between":
			if (values.length === 2) {
				return query.gte(columnId, values[0]).lte(columnId, values[1]);
			}
			return query;
		case "is not between":
			if (values.length === 2) {
				return query.or(
					`${columnId}.lt.${values[0]},${columnId}.gt.${values[1]}`,
				);
			}
			return query;
		default:
			return query;
	}
}

function applyBooleanFilter(
	query: any,
	columnId: string,
	operator: FilterOperator,
	values: string[],
): any {
	switch (operator) {
		case "is":
			return query.eq(columnId, values[0] === "true");
		case "is not":
			return query.not(columnId, "eq", values[0] === "true");
		default:
			return query;
	}
}
