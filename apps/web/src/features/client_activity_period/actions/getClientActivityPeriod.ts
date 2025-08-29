"use server";

import { createClient } from "@/utils/supabase/server";

import type { FiltersState } from "@/components/data-table-filter/core/types";

import type { SortingState } from "@tanstack/react-table";
import { format } from "date-fns";

export async function getClientActivityPeriod(id: string) {
	try {
		const supabase = await createClient();

		// Fetch client activity period with related data
		const { data: clientActivityPeriod, error } = await supabase
			.from("client_activity_period")
			.select(`
				*,
				payment_plan:payment_plans!client_activity_period_payment_plan_fkey (
					id,
					name,
					client:clients!payment_plans_client_id_fkey (
						id,
						name,
						email
					),
					product:products (
						id,
						name,
						description
					),
					payment_plan_template:payment_plan_templates!payment_plans_type_fkey (
						id,
						name
					)
				),
				coach:team_members!client_activity_period_coach_id_fkey (
					id,
					name,
					user:user!team_members_user_id_fkey (
						id,
						name,
						email
					)
				)
			`)
			.eq("id", id)
			.single();

		if (error) {
			throw new Error(
				`Error fetching client activity period: ${error.message}`,
			);
		}

		return clientActivityPeriod;
	} catch (error) {
		console.error("Error fetching client activity period:", error);
		throw error;
	}
}

export async function getClientActivityPeriodBasic(id: string) {
	try {
		const supabase = await createClient();

		// Fetch basic client activity period data without relations
		const { data: clientActivityPeriod, error } = await supabase
			.from("client_activity_period")
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			throw new Error(
				`Error fetching client activity period: ${error.message}`,
			);
		}

		return clientActivityPeriod;
	} catch (error) {
		console.error("Error fetching client activity period:", error);
		throw error;
	}
}

export async function getAllClientActivityPeriods() {
	try {
		const supabase = await createClient();

		const { data: clientActivityPeriods, error } = await supabase
			.from("client_activity_period")
			.select(`
				*,
				payment_plan:payment_plans!client_activity_period_payment_plan_fkey (
					id,
					name,
					client:clients!payment_plans_client_id_fkey (
						id,
						name,
						email
					),
					product:products (
						id,
						name,
						description
					),
					payment_plan_template:payment_plan_templates!payment_plans_type_fkey (
						id,
						name
					)
				),
				coach:team_members!client_activity_period_coach_id_fkey (
					id,
					name,
					user:user!team_members_user_id_fkey (
						id,
						name,
						email
					)
				)
			`)
			.order("created_at", { ascending: false });

		if (error) {
			throw new Error(
				`Error fetching client activity periods: ${error.message}`,
			);
		}

		return clientActivityPeriods || [];
	} catch (error) {
		console.error("Error fetching client activity periods:", error);
		throw error;
	}
}

// Helper function to build filter query based on FiltersState using the view
function buildFilterQuery(supabase: any, filters: FiltersState) {
	let query = supabase.from("v_client_activity_period_core").select("*");

	// Apply filters based on their type and operator
	for (const filter of filters) {
		const { columnId, type, operator, values } = filter;

		if (!values || (Array.isArray(values) && values.length === 0)) continue;

		// Map columnId to the actual database column
		const dbColumn = getDbColumnName(columnId);
		
		// Apply filter based on type and operator
		switch (type) {
			case "text":
				switch (operator) {
					case "contains":
						if (values[0]) {
							query = query.ilike(dbColumn, `%${values[0]}%`);
						}
						break;
					case "does not contain":
						if (values[0]) {
							query = query.not(dbColumn, "ilike", `%${values[0]}%`);
						}
						break;
				}
				break;

			case "option":
				switch (operator) {
					case "is":
						if (values[0]) {
							query = query.eq(dbColumn, values[0]);
						}
						break;
					case "is not":
						if (values[0]) {
							query = query.not(dbColumn, "eq", values[0]);
						}
						break;
					case "is any of":
						if (values.length > 0) {
							query = query.in(dbColumn, values);
						}
						break;
					case "is none of":
						if (values.length > 0) {
							// Use NOT IN syntax: column.not.in.(value1,value2,...)
							query = query.filter(dbColumn, "not.in", `(${values.join(",")})`);
						}
						break;
				}
				break;

			case "date":
				switch (operator) {
					case "is":
						if (values[0]) {
							query = query.eq(dbColumn, formatDateForDb(values[0]));
						}
						break;
					case "is not":
						if (values[0]) {
							query = query.not(dbColumn, "eq", formatDateForDb(values[0]));
						}
						break;
					case "is before":
						if (values[0]) {
							query = query.lt(dbColumn, formatDateForDb(values[0]));
						}
						break;
					case "is on or after":
						if (values[0]) {
							query = query.gte(dbColumn, formatDateForDb(values[0]));
						}
						break;
					case "is after":
						if (values[0]) {
							query = query.gt(dbColumn, formatDateForDb(values[0]));
						}
						break;
					case "is on or before":
						if (values[0]) {
							query = query.lte(dbColumn, formatDateForDb(values[0]));
						}
						break;
					case "is between":
						if (values.length >= 2 && values[0] && values[1]) {
							query = query.gte(dbColumn, formatDateForDb(values[0])).lte(dbColumn, formatDateForDb(values[1]));
						}
						break;
					case "is not between":
						if (values.length >= 2 && values[0] && values[1]) {
							// NOT BETWEEN means: date < start_date OR date > end_date
							query = query.or(`${dbColumn}.lt.${formatDateForDb(values[0])},${dbColumn}.gt.${formatDateForDb(values[1])}`);
						}
						break;
				}
				break;

			case "number":
				switch (operator) {
					case "is":
						if (values[0] !== undefined) {
							query = query.eq(dbColumn, values[0]);
						}
						break;
					case "is not":
						if (values[0] !== undefined) {
							query = query.not(dbColumn, "eq", values[0]);
						}
						break;
					case "is less than":
						if (values[0] !== undefined) {
							query = query.lt(dbColumn, values[0]);
						}
						break;
					case "is greater than":
						if (values[0] !== undefined) {
							query = query.gt(dbColumn, values[0]);
						}
						break;
					case "is greater than or equal to":
						if (values[0] !== undefined) {
							query = query.gte(dbColumn, values[0]);
						}
						break;
					case "is less than or equal to":
						if (values[0] !== undefined) {
							query = query.lte(dbColumn, values[0]);
						}
						break;
					case "is between":
						if (values.length >= 2 && values[0] !== undefined && values[1] !== undefined) {
							query = query.gte(dbColumn, values[0]).lte(dbColumn, values[1]);
						}
						break;
					case "is not between":
						if (values.length >= 2 && values[0] !== undefined && values[1] !== undefined) {
							// NOT BETWEEN means: number < start_value OR number > end_value
							query = query.or(`${dbColumn}.lt.${values[0]},${dbColumn}.gt.${values[1]}`);
						}
						break;
				}
				break;

			case "multiOption":
				switch (operator) {
					case "include any of":
						if (values.length > 0) {
							query = query.in(dbColumn, values);
						}
						break;
					case "include all of":
						// This would require array overlap logic - implement if needed
						if (values.length > 0) {
							query = query.in(dbColumn, values);
						}
						break;
					case "exclude if any of":
						if (values.length > 0) {
							// Use NOT IN syntax for multiOption
							query = query.filter(dbColumn, "not.in", `(${values.join(",")})`);
						}
						break;
				}
				break;
		}
	}

	return query;
}

// Helper function to map column IDs to database column names
function getDbColumnName(columnId: string): string {
	switch (columnId) {
		case "client":
			return "client_id";
		case "product":
			return "product_id";
		case "coach":
		case "coach_id":
			return "coach_id";
		case "start_date":
			return "start_date";
		case "end_date":
			return "end_date";
		case "active":
			return "active";
		case "payment_plan":
			return "payment_plan";
		default:
			return columnId;
	}
}

// Helper function to format date values for database queries (date columns only)
function formatDateForDb(dateValue: string | Date): string {
	// If it's already a properly formatted date string (YYYY-MM-DD), use it as-is
	if (typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
		return dateValue;
	}
	
	// Use date-fns to format consistently as YYYY-MM-DD
	// This handles all date inputs (Date objects, ISO strings, etc.) reliably
	return format(new Date(dateValue), "yyyy-MM-dd");
}

// Helper function to apply sorting
function applySorting(query: any, sorting: SortingState) {
	if (sorting.length === 0) {
		return query.order("created_at", { ascending: false });
	}

	sorting.forEach((sort) => {
		const { id: columnId, desc } = sort;
		query = query.order(columnId, { ascending: !desc });
	});

	return query;
}

export async function getClientActivityPeriodsWithFilters(
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
) {
	try {
		const supabase = await createClient();

		// Build the main query with filters
		let query = buildFilterQuery(supabase, filters);

		// Apply sorting
		query = applySorting(query, sorting);

		// Build count query with the same filters using the view
		let countQuery = buildFilterQuery(supabase, filters);
		countQuery = countQuery.select("id", { count: "exact", head: true });

		// Execute count query
		const { count, error: countError } = await countQuery;

		if (countError) {
			throw new Error(
				`Error counting client activity periods: ${countError.message}`,
			);
		}

		// Apply pagination to main query
		const from = page * pageSize;
		const to = from + pageSize - 1;
		query = query.range(from, to);

		// Execute main query
		const { data: clientActivityPeriods, error } = await query;

		if (error) {
			throw new Error(
				`Error fetching client activity periods: ${error.message}`,
			);
		}

		return {
			data: clientActivityPeriods || [],
			count: count || 0,
		};
	} catch (error) {
		console.error(
			"Error fetching client activity periods with filters:",
			error,
		);
		throw error;
	}
}

// Faceted data for filters using the view
export async function getClientActivityPeriodsFaceted(
	columnId: string,
	filters: FiltersState = [],
) {
	try {
		const supabase = await createClient();

		// Build base query with filters (excluding the column we're getting faceted data for)
		const filteredFilters = filters.filter((f) => f.columnId !== columnId);

		// Use the view for simplified querying
		let query = buildFilterQuery(supabase, filteredFilters);

		// Filter out nulls for the specific column we're getting faceted data for
		switch (columnId) {
			case "client":
				query = query.not("client_id", "is", null);
				break;
			case "product":
				query = query.not("product_id", "is", null);
				break;
			case "coach":
			case "coach_id":
				query = query.not("coach_id", "is", null);
				break;
			case "active":
				query = query.not("active", "is", null);
				break;
			default:
				// For other columns, we might not have faceted data
				return [];
		}

		const { data, error } = await query;

		if (error) {
			throw new Error(`Error fetching faceted data: ${error.message}`);
		}

		// Transform data to faceted format based on column type
		let facetedData: { value: any; label?: string; count: number }[] = [];

		switch (columnId) {
			case "client":
				facetedData =
					data
						?.map((item: any) => ({
							value: item.client_id,
							label: item.client_name,
							count: 1,
						}))
						.filter((item: any) => item.value) || [];
				break;
			case "product":
				facetedData =
					data
						?.map((item: any) => ({
							value: item.product_id,
							label: item.product_name,
							count: 1,
						}))
						.filter((item: any) => item.value) || [];
				break;
			case "coach":
			case "coach_id":
				facetedData =
					data
						?.map((item: any) => ({
							value: item.coach_id,
							label: item.coach_name || `Coach ${item.coach_id}`,
							count: 1,
						}))
						.filter((item: any) => item.value) || [];
				break;
			case "active":
				facetedData =
					data?.map((item: any) => ({
						value: item.active,
						count: 1,
					})) || [];
				break;
			default:
				facetedData = [];
		}

		// Remove duplicates and combine counts
		const groupedData = facetedData.reduce((acc: any[], item: any) => {
			const existing = acc.find((a) => a.value === item.value);
			if (existing) {
				existing.count += 1;
			} else {
				acc.push({
					value: item.value,
					label: item.label,
					count: 1,
				});
			}
			return acc;
		}, []);

		return groupedData;
	} catch (error) {
		console.error("Error fetching faceted data:", error);
		throw error;
	}
}

// Combined optimized query for table data with faceted data
export async function getClientActivityPeriodsWithFaceted(
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
	facetedColumns: string[] = [],
) {
	try {
		// Get main table data
		const tableData = await getClientActivityPeriodsWithFilters(
			filters,
			page,
			pageSize,
			sorting,
		);

		// Get faceted data for each specified column
		const facetedData: Record<string, any[]> = {};

		for (const columnId of facetedColumns) {
			facetedData[columnId] = await getClientActivityPeriodsFaceted(
				columnId,
				filters,
			);
		}

		return {
			clientActivityPeriods: tableData.data,
			totalCount: tableData.count,
			facetedData,
		};
	} catch (error) {
		console.error(
			"Error fetching client activity periods with faceted data:",
			error,
		);
		throw error;
	}
}

// Prefetch helper function for server-side prefetching
export async function prefetchClientActivityPeriodsWithFacetedServer(
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
	facetedColumns: string[] = [],
) {
	return await getClientActivityPeriodsWithFaceted(
		filters,
		page,
		pageSize,
		sorting,
		facetedColumns,
	);
}
