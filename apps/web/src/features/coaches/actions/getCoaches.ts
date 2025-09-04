"use server";

import { createClient } from "@/utils/supabase/server";
export async function getAllCoaches() {
	const supabase = await createClient();

	const { data: coaches, error } = await supabase
		.from("team_members")
		.select(
			`
			id,
			name,
			contract_type,
			onboarding_date,
			user:user!team_members_user_id_fkey (
				id,
				name,
				email
			)
		`,
		)
		.order("name", { ascending: true });

	if (error) {
		console.error("Error fetching coaches:", error);
		throw new Error(`Failed to fetch coaches: ${error.message}`);
	}

	return coaches || [];
}

export async function getActiveCoaches() {
	const supabase = await createClient();

	// Get all team members with user accounts as potential coaches
	const { data: coaches, error } = await supabase
		.from("team_members")
		.select(
			`
			id,
			name,
			contract_type,
			onboarding_date,
			user:user!team_members_user_id_fkey (
				id,
				name,
				email
			)
		`,
		)
		.not("user_id", "is", null) // Only include team members with user accounts
		.order("name", { ascending: true });

	if (error) {
		console.error("Error fetching coaches:", error);
		throw new Error(`Failed to fetch coaches: ${error.message}`);
	}

	return coaches || [];
}

// Function for fetching coaches with filters
export async function getCoaches(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
) {
	try {
		const supabase = await createClient();

		// Build query with LEFT JOINs
		let query = supabase.from("team_members").select(
			`
        id,
        team_id,
        name,
        contract_type,
        created_at,
        user:user!team_members_user_id_fkey ( id, email, role ),
        team:coach_teams!team_members_team_id_fkey (
          id,
          team_name,
          premier_coach_id,
          premier_coach:team_members!coach_teams_premier_coach_id_fkey ( id, name )
        )
      `,
			{ count: "exact" },
		);

		// ----- filters -----
		filters.forEach((filter) => {
			if (!filter?.values?.length) return;

			const values = filter.values;
			const operator = filter.operator || "is";
			const columnId = filter.columnId;

			switch (columnId) {
				case "name":
					if (operator === "contains")
						query = query.ilike("name", `%${values[0]}%`);
					else if (operator === "does not contain")
						query = query.not("name", "ilike", `%${values[0]}%`);
					break;

				case "email":
					// Filter by email through the user relationship
					// First ensure we have a user (exclude nulls)
					query = query.not("user", "is", null);

					if (operator === "contains") {
						query = query.ilike("user.email", `%${values[0]}%`);
					} else if (operator === "does not contain") {
						query = query.not("user.email", "ilike", `%${values[0]}%`);
					}
					break;

				case "team_name":
					// Filter by team_name through the team relationship
					// First ensure we have a team (exclude nulls)
					query = query.not("team", "is", null);

					if (operator === "is") {
						// Single value exact match
						query = query.eq("team.team_name", values[0]);
					} else if (operator === "is not") {
						// Single value not equal
						query = query.neq("team.team_name", values[0]);
					} else if (operator === "is any of") {
						// Multiple values - match any
						if (values.length > 1) {
							query = query.in("team.team_name", values);
						} else {
							query = query.eq("team.team_name", values[0]);
						}
					} else if (operator === "is none of") {
						// Multiple values - match none
						if (values.length > 1) {
							query = query.not("team.team_name", "in", values);
						} else {
							query = query.neq("team.team_name", values[0]);
						}
					}
					break;

				case "premier_coach_id": {
					// Filter by premier_coach_id through the team relationship
					// First ensure we have a team (exclude nulls) for all operators
					query = query.not("team", "is", null);

					if (operator === "is") {
						// Single value exact match
						query = query.eq("team.premier_coach_id", values[0]);
					} else if (operator === "is not") {
						// Single value not equal
						query = query.neq("team.premier_coach_id", values[0]);
					} else if (operator === "is any of") {
						// Multiple values - use IN operator for related table
						if (values.length > 1) {
							query = query.in("team.premier_coach_id", values);
						} else {
							query = query.eq("team.premier_coach_id", values[0]);
						}
					} else if (operator === "is none of") {
						// Multiple values - use NOT IN for related table
						if (values.length > 1) {
							query = query.not("team.premier_coach_id", "in", values);
						} else {
							query = query.neq("team.premier_coach_id", values[0]);
						}
					}
					break;
				}

				case "contract_type":
					if (operator === "is") {
						// Single value exact match
						query = query.eq("contract_type", values[0]);
					} else if (operator === "is not") {
						// Single value not equal
						query = query.neq("contract_type", values[0]);
					} else if (operator === "is any of") {
						// Multiple values - match any
						if (values.length > 1) {
							query = query.in("contract_type", values);
						} else {
							query = query.eq("contract_type", values[0]);
						}
					} else if (operator === "is none of") {
						// Multiple values - match none
						if (values.length > 1) {
							query = query.not("contract_type", "in", values);
						} else {
							query = query.neq("contract_type", values[0]);
						}
					}
					break;

				case "created_at": {
					// Date filtering - convert dates to ISO format for PostgreSQL
					// Remove timezone info or convert to UTC
					const formatDate = (dateStr: string) => {
						// If the date string contains timezone info like "gmt+0200", remove it
						// and ensure we have a proper ISO date string
						try {
							// Parse the date and convert to ISO string (UTC)
							const date = new Date(dateStr);
							return date.toISOString();
						} catch {
							// If parsing fails, return the original value
							return dateStr;
						}
					};

					const formattedValues = values.map(formatDate);

					if (operator === "is") {
						query = query.eq("created_at", formattedValues[0]);
					} else if (operator === "is not") {
						query = query.neq("created_at", formattedValues[0]);
					} else if (operator === "is before") {
						query = query.lt("created_at", formattedValues[0]);
					} else if (operator === "is on or before") {
						query = query.lte("created_at", formattedValues[0]);
					} else if (operator === "is after") {
						query = query.gt("created_at", formattedValues[0]);
					} else if (operator === "is on or after") {
						query = query.gte("created_at", formattedValues[0]);
					} else if (operator === "is between" && formattedValues.length >= 2) {
						query = query
							.gte("created_at", formattedValues[0])
							.lte("created_at", formattedValues[1]);
					} else if (
						operator === "is not between" &&
						formattedValues.length >= 2
					) {
						query = query.or(
							`created_at.lt.${formattedValues[0]},created_at.gt.${formattedValues[1]}`,
						);
					}
					break;
				}
			}
		});

		// ----- sorting -----
		if (sorting.length > 0) {
			const sort = sorting[0];
			query = query.order(sort.id, { ascending: !sort.desc });
		} else {
			query = query.order("name", { ascending: true });
		}

		// ----- pagination -----
		const from = page * pageSize;
		const to = from + pageSize - 1;
		query = query.range(from, to);

		const { data: coaches, error, count } = await query;

		if (error) {
			console.error("Error fetching coaches with filters:", error);
			console.error("Query details:", { filters, page, pageSize, sorting });
			return { coaches: [], totalCount: 0 };
		}

		return { coaches: coaches || [], totalCount: count || 0 };
	} catch (error) {
		console.error("Unexpected error in getCoaches:", error);
		return { coaches: [], totalCount: 0 };
	}
}
// Server-side prefetch for coaches
export async function prefetchCoachesServer(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
) {
	return await getCoaches(filters, page, pageSize, sorting);
}
