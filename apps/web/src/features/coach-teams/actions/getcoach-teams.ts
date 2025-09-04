"use server";

import { createClient } from "@/utils/supabase/server";

export async function getCoachTeam(id: string) {
	try {
		const supabase = await createClient();

		// Fetch coach team with premier coach and count of team members
		const { data: coachTeam, error } = await supabase
			.from("coach_teams")
			.select(`
				*,
				premier_coach:team_members!coach_teams_premier_coach_id_fkey (
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
			console.error("Error fetching coach team:", error);
			return null;
		}

		// Get count of team members (coaches) for this team
		const { count: coachCount, error: countError } = await supabase
			.from("team_members")
			.select("*", { count: "exact", head: true })
			.eq("team_id", id);

		if (countError) {
			console.error("Error fetching coach count:", countError);
		}

		return {
			...coachTeam,
			coach_count: coachCount || 0
		};
	} catch (error) {
		console.error("Unexpected error in getCoachTeam:", error);
		return null;
	}
}

export async function getCoachTeamBasic(id: string) {
	try {
		const supabase = await createClient();

		const { data: coachTeam, error } = await supabase
			.from("coach_teams")
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			console.error("Error fetching coach team basic data:", error);
			return null;
		}

		return coachTeam;
	} catch (error) {
		console.error("Unexpected error in getCoachTeamBasic:", error);
		return null;
	}
}

export async function getAllCoachTeams() {
	try {
		const supabase = await createClient();

		const { data: coachTeams, error } = await supabase
			.from("coach_teams")
			.select(`
				*,
				premier_coach:team_members!coach_teams_premier_coach_id_fkey (
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
			console.error("Error fetching coach teams:", error);
			return [];
		}

		// Get coach counts for each team
		const teamsWithCounts = await Promise.all(
			(coachTeams || []).map(async (team) => {
				const { count: coachCount, error: countError } = await supabase
					.from("team_members")
					.select("*", { count: "exact", head: true })
					.eq("team_id", team.id);

				if (countError) {
					console.error(`Error fetching coach count for team ${team.id}:`, countError);
				}

				return {
					...team,
					coach_count: coachCount || 0
				};
			})
		);

		return teamsWithCounts;
	} catch (error) {
		console.error("Unexpected error in getAllCoachTeams:", error);
		return [];
	}
}

export async function getCoachTeamsWithFilters(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
) {
	try {
		const supabase = await createClient();

		let query = supabase.from("coach_teams").select(
			`
				*,
				premier_coach:team_members!coach_teams_premier_coach_id_fkey (
					id,
					name,
					user:user!team_members_user_id_fkey (
						id,
						name,
						email
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
					case "premier_coach_id":
						// Foreign key filters
						if (operator === "is") {
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
			console.error("Error fetching coach teams with filters:", error);
			return { data: [], count: 0 };
		}

		// Get coach counts for each team
		const teamsWithCounts = await Promise.all(
			(data || []).map(async (team) => {
				const { count: coachCount, error: countError } = await supabase
					.from("team_members")
					.select("*", { count: "exact", head: true })
					.eq("team_id", team.id);

				if (countError) {
					console.error(`Error fetching coach count for team ${team.id}:`, countError);
				}

				return {
					...team,
					coach_count: coachCount || 0
				};
			})
		);

		return { data: teamsWithCounts, count: count || 0 };
	} catch (error) {
		console.error("Unexpected error in getCoachTeamsWithFilters:", error);
		return { data: [], count: 0 };
	}
}

// Combined query for coach teams with faceted data - optimized single call
export async function getCoachTeamsWithFaceted(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
	facetedColumns: string[] = [],
) {
	try {
		const supabase = await createClient();

		// Get main coach teams data
		const coachTeamsResult = await getCoachTeamsWithFilters(
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
					.from("coach_teams")
					.select(`${columnId}, count:${columnId}.count()`, { head: false });

				// Apply existing filters (excluding the column we're faceting)
				filters
					.filter((filter) => filter.columnId !== columnId)
					.forEach((filter) => {
						if (filter.values && filter.values.length > 0) {
							const values = filter.values;
							const operator = filter.operator || "is";
							const filterColumnId = filter.columnId;

							// Apply same operator logic as main query
							switch (filterColumnId) {
								case "premier_coach_id":
									// Foreign key filters
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

								case "created_at":
								case "updated_at":
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

				// Convert server-aggregated data to Map format
				const facetMap = new Map<string, number>();
				facetData?.forEach((item: any) => {
					const value = item[columnId];
					const count = item.count;
					if (value && count) {
						const key = String(value);
						facetMap.set(key, count);
					}
				});

				facetedData[columnId] = facetMap;
			}),
		);

		return {
			coachTeams: coachTeamsResult.data,
			totalCount: coachTeamsResult.count,
			facetedData,
		};
	} catch (error) {
		console.error("Unexpected error in getCoachTeamsWithFaceted:", error);
		return {
			coachTeams: [],
			totalCount: 0,
			facetedData: {},
		};
	}
}

export async function getCoachTeamsFaceted(
	columnId: string,
	filters: any[] = [],
) {
	try {
		const supabase = await createClient();

		let query = supabase
			.from("coach_teams")
			.select(`${columnId}, count:${columnId}.count()`, { head: false });

		// Apply existing filters (excluding the column we're faceting)
		filters
			.filter((filter) => filter.columnId !== columnId)
			.forEach((filter) => {
				if (filter.values && filter.values.length > 0) {
					const values = filter.values;
					const operator = filter.operator || "is";
					const filterColumnId = filter.columnId;

					// Apply same operator logic as main query
					switch (filterColumnId) {
						case "premier_coach_id":
							// Foreign key filters
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

		// Convert server-aggregated data to Map format
		const facetedMap = new Map<string, number>();
		data?.forEach((item: any) => {
			const value = item[columnId];
			const count = item.count;
			if (value && count) {
				const key = String(value);
				facetedMap.set(key, count);
			}
		});

		return facetedMap;
	} catch (error) {
		console.error("Unexpected error in getCoachTeamsFaceted:", error);
		return new Map<string, number>();
	}
}

// Server-side prefetch functions for page-level prefetching
export async function prefetchCoachTeamsTableDataServer(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
) {
	return await getCoachTeamsWithFilters(filters, page, pageSize, sorting);
}

export async function prefetchCoachTeamsFacetedServer(
	columnId: string,
	filters: any[] = [],
) {
	return await getCoachTeamsFaceted(columnId, filters);
}

// Server-side prefetch for combined coach teams+faceted data
export async function prefetchCoachTeamsWithFacetedServer(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
	facetedColumns: string[] = [],
) {
	return await getCoachTeamsWithFaceted(
		filters,
		page,
		pageSize,
		sorting,
		facetedColumns,
	);
}
