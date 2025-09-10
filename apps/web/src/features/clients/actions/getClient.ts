"use server";

import { createClient } from "@/utils/supabase/server";

export async function getClient(id: string) {
	try {
		const supabase = await createClient();

		// Fetch client with related data
		const { data: client, error } = await supabase
			.from("clients")
			.select(`
				*,
				client_emails (
					id,
					email,
					created_at
				),
				client_assignments (
					id,
					coach_id,
					start_date,
					end_date,
					assignment_type,
					assigned_by,
					coach:team_members!client_assignments_coach_id_fkey (
						id,
						name,
						user:user!team_members_user_id_fkey (
							id,
							name,
							email
						)
					)
				),
				client_goals (
					id,
					title,
					description,
					status,
					target_value,
					current_value,
					due_date,
					started_at,
					priority,
					created_at
				),
				client_wins (
					id,
					title,
					description,
					win_date,
					recorded_by,
					created_at,
					recorded_by_user:user!client_wins_recorded_by_user_id_fk (
						id,
						name,
						email
					),
					client_win_tags (
						id,
						tag_id,
						win_tags (
							id,
							name,
							color
						)
					)
				),
				client_nps (
					id,
					nps_score,
					notes,
					provided_by,
					recorded_by,
					recorded_date,
					created_at,
					updated_at
				),
				client_testimonials (
					id,
					content,
					testimonial_type,
					testimonial_url,
					recorded_by,
					recorded_date,
					created_at,
					updated_at
				),
				payment_plans (
					id,
					name,
					notes,
					product_id,
					term_start_date,
					term_end_date,
					total_amount,
					type,
					created_at,
					updated_at,
					payment_slots (
						id,
						amount_due,
						amount_paid,
						due_date,
						notes,
						created_at,
						updated_at
					),
					payment_plan_templates (
						id,
						name,
						product_id,
						program_length_months,
						created_at,
						updated_at
					),
					products (
						id,
						name,
						description,
						client_unit,
						default_duration_months,
						is_active,
						created_at,
						updated_at
					)
				)
			`)
			.eq("id", id)
			.eq("is_deleted", false)
			.single();

		if (error) {
			console.error("Error fetching client:", error);
			return null;
		}

		// Fetch client activity periods separately using the view
		const { data: activityPeriods } = await supabase
			.from("v_client_activity_period_core")
			.select(`
				id,
				active,
				start_date,
				end_date,
				coach_id,
				coach_name,
				client_id,
				client_name,
				payment_plan,
				product_id,
				product_name,
				created_at,
				updated_at
			`)
			.eq("client_id", id);

		// Add the activity periods to the client object
		if (client) {
			return {
				...client,
				client_activity_periods: activityPeriods || [],
			};
		}

		return client;
	} catch (error) {
		console.error("Unexpected error in getClient:", error);
		return null;
	}
}

export async function getClientBasic(id: string) {
	try {
		const supabase = await createClient();

		const { data: client, error } = await supabase
			.from("clients")
			.select("*")
			.eq("id", id)
			.eq("is_deleted", false)
			.single();

		if (error) {
			console.error("Error fetching client basic data:", error);
			return null;
		}

		return client;
	} catch (error) {
		console.error("Unexpected error in getClientBasic:", error);
		return null;
	}
}

export async function getClientsBasic() {
	try {
		const supabase = await createClient();

		const { data: client, error } = await supabase
			.from("clients")
			.select("*")
			.eq("is_deleted", false)

		if (error) {
			console.error("Error fetching client basic data:", error);
			return null;
		}

		return client;
	} catch (error) {
		console.error("Unexpected error in getClientBasic:", error);
		return null;
	}
}

export async function getAllClients() {
	try {
		const supabase = await createClient();

		const { data: clients, error } = await supabase
			.from("clients")
			.select(`
				*,
				client_assignments (
					id,
					coach_id,
					assignment_type,
					start_date,
					end_date,
					coach:team_members!client_assignments_coach_id_fkey (
						id,
						name,
						user:user!team_members_user_id_fkey (
							id,
							name,
							email
						)
					)
				)
			`)
			.eq("is_deleted", false)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching clients:", error);
			return [];
		}

		return clients || [];
	} catch (error) {
		console.error("Unexpected error in getAllClients:", error);
		return [];
	}
}

export async function getClientsWithFilters(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
) {
	try {
		const supabase = await createClient();

		// Simplified query without nested joins to prevent timeout
		let query = supabase
			.from("clients")
			.select("*", { count: "exact" })
			.eq("is_deleted", false);

		// Apply filters with proper operator support
		filters.forEach((filter) => {
			if (filter.values && filter.values.length > 0) {
				const values = filter.values;
				const operator = filter.operator || "is";
				const columnId = filter.columnId;

				// Apply filter based on column type and operator
				switch (columnId) {
					case "name":
					case "email":
					case "phone":
						// Text fields - support contains/does not contain
						if (operator === "contains") {
							query = query.ilike(columnId, `%${values[0]}%`);
						} else if (operator === "does not contain") {
							query = query.not(columnId, "ilike", `%${values[0]}%`);
						}
						break;

					case "overall_status":
					case "everfit_access":
						// Status can be treated as both text and option
						if (operator === "contains") {
							query = query.ilike(columnId, `%${values[0]}%`);
						} else if (operator === "does not contain") {
							query = query.not(columnId, "ilike", `%${values[0]}%`);
						} else if (operator === "is") {
							query = query.eq(columnId, values[0]);
						} else if (operator === "is not") {
							query = query.not(columnId, "eq", values[0]);
						} else if (operator === "is any of") {
							query = query.in(columnId, values);
						} else if (operator === "is none of") {
							query = query.not(columnId, "in", `(${values.join(",")})`);
						}
						break;

					case "created_at":
					case "updated_at":
					case "onboarding_completed_date":
					case "offboard_date":
						// Date fields - support various date operators
						// Convert dates to proper format for timestamptz fields
						const formatDateForQuery = (date: any, isEndOfDay = false) => {
							let dateObj: Date;
							if (date instanceof Date) {
								dateObj = new Date(date);
							} else {
								dateObj = new Date(date);
							}
							
							// For timestamptz fields, we need to handle date ranges properly
							if (isEndOfDay) {
								// Set to end of day (23:59:59.999)
								dateObj.setHours(23, 59, 59, 999);
							} else {
								// Set to start of day (00:00:00.000)
								dateObj.setHours(0, 0, 0, 0);
							}
							
							return dateObj.toISOString();
						};

						if (operator === "is") {
							// For "is" operator on timestamptz, use date range for the entire day
							const startOfDay = formatDateForQuery(values[0], false);
							const endOfDay = formatDateForQuery(values[0], true);
							query = query.gte(columnId, startOfDay).lte(columnId, endOfDay);
						} else if (operator === "is not") {
							// For "is not" operator, exclude the entire day
							const startOfDay = formatDateForQuery(values[0], false);
							const endOfDay = formatDateForQuery(values[0], true);
							query = query.or(`${columnId}.lt.${startOfDay},${columnId}.gt.${endOfDay}`);
						} else if (operator === "is before") {
							const startOfDay = formatDateForQuery(values[0], false);
							query = query.lt(columnId, startOfDay);
						} else if (operator === "is on or before") {
							const endOfDay = formatDateForQuery(values[0], true);
							query = query.lte(columnId, endOfDay);
						} else if (operator === "is after") {
							const endOfDay = formatDateForQuery(values[0], true);
							query = query.gt(columnId, endOfDay);
						} else if (operator === "is on or after") {
							const startOfDay = formatDateForQuery(values[0], false);
							query = query.gte(columnId, startOfDay);
						} else if (operator === "is between" && values.length === 2) {
							const startOfDay = formatDateForQuery(values[0], false);
							const endOfDay = formatDateForQuery(values[1], true);
							query = query.gte(columnId, startOfDay).lte(columnId, endOfDay);
						} else if (operator === "is not between" && values.length === 2) {
							const startOfDay = formatDateForQuery(values[0], false);
							const endOfDay = formatDateForQuery(values[1], true);
							query = query.or(
								`${columnId}.lt.${startOfDay},${columnId}.gt.${endOfDay}`,
							);
						}
						break;

					// Handle boolean fields
					case "onboarding_call_completed":
					case "two_week_check_in_call_completed":
					case "vip_terms_signed":
						if (operator === "is") {
							query = query.eq(columnId, values[0] === "true");
						} else if (operator === "is not") {
							query = query.not(columnId, "eq", values[0] === "true");
						}
						break;
				}
			}
		});

		// Apply sorting
		if (sorting.length > 0) {
			const sort = sorting[0];
			query = query.order(sort.id, { ascending: !sort.desc });
		} else {
			query = query.order("created_at", { ascending: false });
		}

		// Apply pagination
		const from = page * pageSize;
		const to = from + pageSize - 1;
		query = query.range(from, to);

		const { data, error, count } = await query;

		if (error) {
			console.error("Error fetching clients with filters:", error);
			return { data: [], count: 0 };
		}

		return { data: data || [], count: count || 0 };
	} catch (error) {
		console.error("Unexpected error in getClientsWithFilters:", error);
		return { data: [], count: 0 };
	}
}

// Simplified clients query without faceted data - much faster
export async function getClientsWithFaceted(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
	facetedColumns: string[] = [], // Not used anymore but kept for compatibility
) {
	try {
		// Just return the clients data without any faceted counts
		const clientsResult = await getClientsWithFilters(
			filters,
			page,
			pageSize,
			sorting,
		);

		return {
			clients: clientsResult.data,
			totalCount: clientsResult.count,
			facetedData: {}, // Empty since we don't need counts anymore
		};
	} catch (error) {
		console.error("Unexpected error in getClientsWithFaceted:", error);
		return {
			clients: [],
			totalCount: 0,
			facetedData: {},
		};
	}
}

// Removed getClientsFaceted since we no longer need individual faceted queries

// Server-side prefetch functions for page-level prefetching
export async function prefetchClientsTableDataServer(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
) {
	return await getClientsWithFilters(filters, page, pageSize, sorting);
}

// Removed prefetchClientsFacetedServer since getClientsFaceted is no longer needed

// Server-side prefetch for combined clients+faceted data
export async function prefetchClientsWithFacetedServer(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
	facetedColumns: string[] = ["overall_status"],
) {
	return await getClientsWithFaceted(
		filters,
		page,
		pageSize,
		sorting,
		facetedColumns,
	);
}
