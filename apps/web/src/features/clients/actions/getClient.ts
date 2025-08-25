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
					)
				),
				client_activity_period (
					id,
					active,
					start_date,
					end_date,
					coach_id,
					created_at,
					updated_at,
					coach:team_members!client_activity_period_coach_id_fkey (
						id,
						name,
						user:user!team_members_user_id_fkey (
							id,
							name,
							email
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
					platform,
					product_id,
					subscription_id,
					term_start_date,
					term_end_date,
					total_amount,
					total_amount_paid,
					type,
					created_at,
					updated_at,
					payment_slots (
						id,
						amount_due,
						amount_paid,
						due_date,
						notes,
						payment_id,
						created_at,
						updated_at
					)
				)
			`)
			.eq("id", id)
			.single();

		if (error) {
			console.error("Error fetching client:", error);
			return null;
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

		let query = supabase.from("clients").select(
			`
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
			`,
			{ count: "exact" },
		);

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
						if (operator === "is") {
							query = query.eq(columnId, values[0]);
						} else if (operator === "is not") {
							query = query.not(columnId, "eq", values[0]);
						} else if (operator === "is before") {
							query = query.lt(columnId, values[0]);
						} else if (operator === "is on or before") {
							query = query.lte(columnId, values[0]);
						} else if (operator === "is after") {
							query = query.gt(columnId, values[0]);
						} else if (operator === "is on or after") {
							query = query.gte(columnId, values[0]);
						} else if (operator === "is between" && values.length === 2) {
							query = query.gte(columnId, values[0]).lte(columnId, values[1]);
						} else if (operator === "is not between" && values.length === 2) {
							query = query.or(
								`${columnId}.lt.${values[0]},${columnId}.gt.${values[1]}`,
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

// Combined query for clients with faceted data - optimized single call
export async function getClientsWithFaceted(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
	facetedColumns: string[] = ["overall_status"],
) {
	try {
		const supabase = await createClient();

		// Get main clients data
		const clientsResult = await getClientsWithFilters(
			filters,
			page,
			pageSize,
			sorting,
		);

		// Get faceted data for each requested column
		const facetedData: Record<string, Map<string, number>> = {};

		// Fetch faceted counts for each column in parallel
		await Promise.all(
			facetedColumns.map(async (columnId) => {
				let facetQuery = supabase
					.from("clients")
					.select(columnId, { count: "exact" });

				// Apply existing filters (excluding the column we're faceting) using same operator logic
				filters
					.filter((filter) => filter.columnId !== columnId)
					.forEach((filter) => {
						if (filter.values && filter.values.length > 0) {
							const values = filter.values;
							const operator = filter.operator || "is";
							const filterColumnId = filter.columnId;

							// Apply same operator logic as main query
							switch (filterColumnId) {
								case "first_name":
								case "last_name":
								case "email":
									if (operator === "contains") {
										facetQuery = facetQuery.ilike(
											filterColumnId,
											`%${values[0]}%`,
										);
									} else if (operator === "does not contain") {
										facetQuery = facetQuery.not(
											filterColumnId,
											"ilike",
											`%${values[0]}%`,
										);
									}
									break;

								case "product_id":
									if (operator === "is") {
										facetQuery = facetQuery.eq(filterColumnId, values[0]);
									} else if (operator === "is not") {
										facetQuery = facetQuery.not(
											filterColumnId,
											"eq",
											values[0],
										);
									} else if (operator === "is any of") {
										facetQuery = facetQuery.in(filterColumnId, values);
									} else if (operator === "is none of") {
										facetQuery = facetQuery.not(
											filterColumnId,
											"in",
											`(${values.join(",")})`,
										);
									}
									break;

								case "status":
									if (operator === "contains") {
										facetQuery = facetQuery.ilike(
											filterColumnId,
											`%${values[0]}%`,
										);
									} else if (operator === "does not contain") {
										facetQuery = facetQuery.not(
											filterColumnId,
											"ilike",
											`%${values[0]}%`,
										);
									} else if (operator === "is") {
										facetQuery = facetQuery.eq(filterColumnId, values[0]);
									} else if (operator === "is not") {
										facetQuery = facetQuery.not(
											filterColumnId,
											"eq",
											values[0],
										);
									} else if (operator === "is any of") {
										facetQuery = facetQuery.in(filterColumnId, values);
									} else if (operator === "is none of") {
										facetQuery = facetQuery.not(
											filterColumnId,
											"in",
											`(${values.join(",")})`,
										);
									}
									break;

								case "start_date":
								case "end_date":
								case "created_at":
									if (operator === "is") {
										facetQuery = facetQuery.eq(filterColumnId, values[0]);
									} else if (operator === "is not") {
										facetQuery = facetQuery.not(
											filterColumnId,
											"eq",
											values[0],
										);
									} else if (operator === "is before") {
										facetQuery = facetQuery.lt(filterColumnId, values[0]);
									} else if (operator === "is on or before") {
										facetQuery = facetQuery.lte(filterColumnId, values[0]);
									} else if (operator === "is after") {
										facetQuery = facetQuery.gt(filterColumnId, values[0]);
									} else if (operator === "is on or after") {
										facetQuery = facetQuery.gte(filterColumnId, values[0]);
									} else if (operator === "is between" && values.length === 2) {
										facetQuery = facetQuery
											.gte(filterColumnId, values[0])
											.lte(filterColumnId, values[1]);
									} else if (
										operator === "is not between" &&
										values.length === 2
									) {
										facetQuery = facetQuery.or(
											`${filterColumnId}.lt.${values[0]},${filterColumnId}.gt.${values[1]}`,
										);
									}
									break;
							}
						}
					});

				const { data: facetData, error: facetError } = await facetQuery;

				if (facetError) {
					console.error(
						`Error fetching faceted data for ${columnId}:`,
						facetError,
					);
					facetedData[columnId] = new Map();
					return;
				}

				// Convert to Map format
				const facetMap = new Map<string, number>();
				facetData?.forEach((item: any) => {
					const value = item[columnId];
					if (value) {
						const key = String(value);
						facetMap.set(key, (facetMap.get(key) || 0) + 1);
					}
				});

				facetedData[columnId] = facetMap;
			}),
		);

		return {
			clients: clientsResult.data,
			totalCount: clientsResult.count,
			facetedData,
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

export async function getClientsFaceted(columnId: string, filters: any[] = []) {
	try {
		const supabase = await createClient();

		let query = supabase.from("clients").select(columnId, { count: "exact" });

		// Apply existing filters (excluding the column we're faceting) using same operator logic
		filters
			.filter((filter) => filter.columnId !== columnId)
			.forEach((filter) => {
				if (filter.values && filter.values.length > 0) {
					const values = filter.values;
					const operator = filter.operator || "is";
					const filterColumnId = filter.columnId;

					// Apply same operator logic as main query
					switch (filterColumnId) {
						case "name":
						case "email":
						case "phone":
							if (operator === "contains") {
								query = query.ilike(filterColumnId, `%${values[0]}%`);
							} else if (operator === "does not contain") {
								query = query.not(filterColumnId, "ilike", `%${values[0]}%`);
							}
							break;

						case "overall_status":
						case "everfit_access":
							if (operator === "is") {
								query = query.eq(filterColumnId, values[0]);
							} else if (operator === "is not") {
								query = query.not(filterColumnId, "eq", values[0]);
							} else if (operator === "is any of") {
								query = query.in(filterColumnId, values);
							} else if (operator === "is none of") {
								query = query.not(
									filterColumnId,
									"in",
									`(${values.join(",")})`,
								);
							}
							break;

						case "created_at":
						case "updated_at":
						case "onboarding_completed_date":
						case "offboard_date":
							if (operator === "is") {
								query = query.eq(filterColumnId, values[0]);
							} else if (operator === "is not") {
								query = query.not(filterColumnId, "eq", values[0]);
							} else if (operator === "is before") {
								query = query.lt(filterColumnId, values[0]);
							} else if (operator === "is on or before") {
								query = query.lte(filterColumnId, values[0]);
							} else if (operator === "is after") {
								query = query.gt(filterColumnId, values[0]);
							} else if (operator === "is on or after") {
								query = query.gte(filterColumnId, values[0]);
							} else if (operator === "is between" && values.length === 2) {
								query = query
									.gte(filterColumnId, values[0])
									.lte(filterColumnId, values[1]);
							} else if (operator === "is not between" && values.length === 2) {
								query = query.or(
									`${filterColumnId}.lt.${values[0]},${filterColumnId}.gt.${values[1]}`,
								);
							}
							break;
					}
				}
			});

		const { data, error } = await query;

		if (error) {
			console.error("Error fetching faceted data:", error);
			return new Map<string, number>();
		}

		// Convert to Map format
		const facetedMap = new Map<string, number>();
		data?.forEach((item: any) => {
			const value = item[columnId];
			if (value) {
				const key = String(value);
				facetedMap.set(key, (facetedMap.get(key) || 0) + 1);
			}
		});

		return facetedMap;
	} catch (error) {
		console.error("Unexpected error in getClientsFaceted:", error);
		return new Map<string, number>();
	}
}

// Server-side prefetch functions for page-level prefetching
export async function prefetchClientsTableDataServer(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
) {
	return await getClientsWithFilters(filters, page, pageSize, sorting);
}

export async function prefetchClientsFacetedServer(
	columnId: string,
	filters: any[] = [],
) {
	return await getClientsFaceted(columnId, filters);
}

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
