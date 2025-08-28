"use server";

import { createClient } from "@/utils/supabase/server";

import type { FiltersState } from "@/components/data-table-filter/core/types";

import type { SortingState } from "@tanstack/react-table";

export async function getClientActivityPeriod(id: string) {
	try {
		const supabase = await createClient();

		// Fetch client activity period with related data
		const { data: clientActivityPeriod, error } = await supabase
			.from("client_activity_period")
			.select(`
				*,
				client:clients!client_activity_period_client_id_clients_id_fk (
					id,
					name,
					email
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
				client:clients!client_activity_period_client_id_clients_id_fk (
					id,
					name,
					email
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

// Helper function to build filter query based on FiltersState
function buildFilterQuery(supabase: any, filters: FiltersState) {
	let query = supabase.from("client_activity_period").select(`
		*,
		client:clients!client_activity_period_client_id_clients_id_fk (
			id,
			name,
			email
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
	`);

	// Apply filters
	filters.forEach((filter) => {
		const { columnId, values } = filter;

		if (!values || (Array.isArray(values) && values.length === 0)) return;

		// For consistency, use the first value if it's an array
		const value = Array.isArray(values) ? values[0] : values;

		switch (columnId) {
			case "client":
				// Filter by client ID (since we're using option dropdown with IDs)
				if (Array.isArray(values)) {
					query = query.in("client_id", values);
				} else {
					query = query.eq("client_id", value);
				}
				break;
			case "coach":
				// Filter by coach ID (since we're using option dropdown with IDs)
				if (Array.isArray(values)) {
					query = query.in("coach_id", values);
				} else {
					query = query.eq("coach_id", value);
				}
				break;
			case "start_date":
				if (Array.isArray(values) && values.length === 2) {
					query = query
						.gte("start_date", values[0])
						.lte("start_date", values[1]);
				}
				break;
			case "end_date":
				if (Array.isArray(values) && values.length === 2) {
					query = query.gte("end_date", values[0]).lte("end_date", values[1]);
				}
				break;
			case "active":
				if (Array.isArray(values)) {
					query = query.in("active", values);
				} else {
					query = query.eq("active", values);
				}
				break;
		}
	});

	return query;
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

		// Get total count for pagination - no joins needed as filters use direct columns
		let countQuery = supabase
			.from("client_activity_period")
			.select("id", { count: "exact", head: true });

		// Apply the same filters to count query
		filters.forEach((filter) => {
			const { columnId, values } = filter;

			if (!values || (Array.isArray(values) && values.length === 0)) return;

			// For consistency, use the first value if it's an array
			const value = Array.isArray(values) ? values[0] : values;

			switch (columnId) {
				case "client":
					// Filter by client ID (since we're using option dropdown with IDs)
					if (Array.isArray(values)) {
						countQuery = countQuery.in("client_id", values);
					} else {
						countQuery = countQuery.eq("client_id", value);
					}
					break;
				case "coach":
					// Filter by coach ID (since we're using option dropdown with IDs)
					if (Array.isArray(values)) {
						countQuery = countQuery.in("coach_id", values);
					} else {
						countQuery = countQuery.eq("coach_id", value);
					}
					break;
				case "start_date":
					if (Array.isArray(values) && values.length === 2) {
						countQuery = countQuery
							.gte("start_date", values[0])
							.lte("start_date", values[1]);
					}
					break;
				case "end_date":
					if (Array.isArray(values) && values.length === 2) {
						countQuery = countQuery
							.gte("end_date", values[0])
							.lte("end_date", values[1]);
					}
					break;
				case "active":
					if (Array.isArray(values)) {
						countQuery = countQuery.in("active", values);
					} else {
						countQuery = countQuery.eq("active", values);
					}
					break;
			}
		});

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

// Faceted data for filters
export async function getClientActivityPeriodsFaceted(
	columnId: string,
	filters: FiltersState = [],
) {
	try {
		const supabase = await createClient();

		// Build base query with filters (excluding the column we're getting faceted data for)
		const filteredFilters = filters.filter((f) => f.columnId !== columnId);

		// Start with base query that includes all necessary joins
		let query = supabase.from("client_activity_period").select(`
			*,
			client:clients!client_activity_period_client_id_clients_id_fk (
				id,
				name,
				email
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
		`);

		// Apply the filtered filters to the query
		filteredFilters.forEach((filter) => {
			const { columnId: filterColumnId, values } = filter;

			if (!values || (Array.isArray(values) && values.length === 0)) return;

			// For consistency, use the first value if it's an array
			const value = Array.isArray(values) ? values[0] : values;

			switch (filterColumnId) {
				case "client":
					if (Array.isArray(values)) {
						query = query.in("client_id", values);
					} else {
						query = query.eq("client_id", value);
					}
					break;
				case "coach":
					if (Array.isArray(values)) {
						query = query.in("coach_id", values);
					} else {
						query = query.eq("coach_id", value);
					}
					break;
				case "start_date":
					if (Array.isArray(values) && values.length === 2) {
						query = query
							.gte("start_date", values[0])
							.lte("start_date", values[1]);
					}
					break;
				case "end_date":
					if (Array.isArray(values) && values.length === 2) {
						query = query.gte("end_date", values[0]).lte("end_date", values[1]);
					}
					break;
				case "active":
					if (Array.isArray(values)) {
						query = query.in("active", values);
					} else {
						query = query.eq("active", values);
					}
					break;
			}
		});

		// Now modify the query to only select what we need for faceted data
		switch (columnId) {
			case "client":
				// We already have the joins, just filter out nulls
				query = query.not("client_id", "is", null);
				break;
			case "coach":
				// We already have the joins, just filter out nulls
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
							value: item.client?.id,
							label: item.client?.name,
							count: 1,
						}))
						.filter((item: any) => item.value) || [];
				break;
			case "coach":
				facetedData =
					data
						?.map((item: any) => ({
							value: item.coach?.id,
							label: item.coach?.name || `Coach ${item.coach?.id}`,
							count: 1,
						}))
						.filter((item: any) => item.value) || [];
				break;
			case "active":
				facetedData =
					data?.map((item: any) => ({
						value: item[columnId],
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
				existing.count += 1; // Increment count properly
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
