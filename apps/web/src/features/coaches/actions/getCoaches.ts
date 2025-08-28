"use server";

import { createClient } from "@/utils/supabase/server";
/**
 * Fetches all coaches (team members) with basic profile and related user info.
 *
 * Retrieves records from the "team_members" table ordered by name and includes
 * the following fields for each coach: `id`, `name`, `contract_type`,
 * `onboarding_date`, and the related `user` object containing `id`, `name`, and
 * `email`.
 *
 * @returns An array of coach records with nested `user` data; returns an empty
 * array if no coaches are found.
 */
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
		`
    )
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching coaches:", error);
    throw new Error(`Failed to fetch coaches: ${error.message}`);
  }

  return coaches || [];
}

/**
 * Fetches all team members who have associated user accounts (active coaches).
 *
 * Returns team_members rows that have a non-null `user_id`, selecting:
 * - id, name, contract_type, onboarding_date
 * - nested user fields: id, name, email
 *
 * @returns An array of coach records (empty array if none). Each item includes the selected `team_members` fields and a `user` object when present.
 * @throws Error if the database query fails.
 */
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
		`
    )
    .not("user_id", "is", null) // Only include team members with user accounts
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching coaches:", error);
    throw new Error(`Failed to fetch coaches: ${error.message}`);
  }

  return coaches || [];
}

/**
 * Fetches coaches with support for filtering, sorting, pagination, and faceted counts.
 *
 * Builds a main query against the team_members table (including related user and team/premier coach data),
 * applies the provided filters and sorting, returns a paginated list of coaches plus exact total count,
 * and computes faceted counts for each requested column.
 *
 * Filters:
 * - Expects an array of filter objects with { columnId, operator?, values[] }.
 * - Supported columns: `name`, `email` (text: `contains` / `does not contain`),
 *   `premier_coach_id` (filters via team.premier_coach_id using `is`/`is not`, single or multiple values),
 *   and `contract_type` / `created_at` (date-like operators: `is`, `is not`, `is before`, `is on or before`,
 *   `is after`, `is on or after`, `is between`, `is not between`).
 *
 * Faceting:
 * - facetedColumns lists column ids to compute counts for (default `["contract_type"]`).
 * - When `premier_coach_id` is faceted or present in filters, queries include team and premier coach data
 *   and facet keys for `premier_coach_id` are the premier coach IDs as strings.
 *
 * @param filters - Array of filter objects (see Filters section above). Defaults to [].
 * @param page - Zero-based page index for pagination. Defaults to 0.
 * @param pageSize - Number of items per page. Defaults to 25.
 * @param sorting - Array of sorting rules; first rule is applied if present. Defaults to [].
 * @param facetedColumns - List of column ids to generate facet counts for. Defaults to ["contract_type"].
 * @returns An object with:
 *  - `coaches`: Array of coach records (includes related user and team/premier coach where selected),
 *  - `totalCount`: exact total number of matching records,
 *  - `facetedData`: Record mapping column id -> Map<string, number> of facet value -> count.
 */
export async function getCoachesWithFaceted(
  filters: any[] = [],
  page = 0,
  pageSize = 25,
  sorting: any[] = [],
  facetedColumns: string[] = ["contract_type"]
) {
  try {
    const supabase = await createClient();

    // Build main query with proper table structure
    let query = supabase.from("team_members").select(
      `
				id,
				team_id,
				name,
				contract_type,
				created_at,
				user:user!team_members_user_id_fkey (
					id,
					email,
					role
				),
				team:coach_teams!team_members_team_id_fkey (
					id,
					premier_coach:team_members!coach_teams_premier_coach_id_fkey (
						id,
						name
					)
				)
			`,
      { count: "exact" }
    );

    // Apply filters with proper operator support
    filters.forEach((filter) => {
      if (filter.values && filter.values.length > 0) {
        const values = filter.values;
        const operator = filter.operator || "is";
        const columnId = filter.columnId;
        console.log("columnID", columnId, "values:", values, "operator:", operator);
        // Apply filter based on column type and operator
        switch (columnId) {
          case "name":
          case "email":
            // Text fields - support contains/does not contain
            if (operator === "contains") {
              query = query.ilike(columnId, `%${values[0]}%`);
            } else if (operator === "does not contain") {
              query = query.not(columnId, "ilike", `%${values[0]}%`);
            }
            break;

          case "premier_coach_id":
            // Filter by premier coach ID - need to filter where the team's premier_coach_id matches
            console.log("APPLYING PREMIER COACH FILTER:", values, operator);
            if (operator === "is") {
              if (values.length === 1) {
                console.log("Filtering by single premier coach ID:", values[0]);
                // Filter team members whose team has this premier coach
                query = query.filter("team.premier_coach_id", "eq", values[0]);
              } else if (values.length > 1) {
                console.log("Filtering by multiple premier coach IDs:", values);
                // For multiple values, use IN
                query = query.filter("team.premier_coach_id", "in", `(${values.join(",")})`);
              }
            } else if (operator === "is not") {
              if (values.length === 1) {
                query = query.filter("team.premier_coach_id", "neq", values[0]);
              } else if (values.length > 1) {
                query = query.not("team.premier_coach_id", "in", `(${values.join(",")})`);
              }
            }
            console.log("Query after premier coach filter applied");
            break;

          case "contract_type":
          case "created_at":
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
                `${columnId}.lt.${values[0]},${columnId}.gt.${values[1]}`
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
      query = query.order("name", { ascending: true });
    }

    // Apply pagination
    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data: coaches, error, count } = await query;

    if (error) {
      console.error("Error fetching coaches with filters:", error);
      return {
        coaches: [],
        totalCount: 0,
        facetedData: {},
      };
    }

    // Get faceted data for each requested column
    const facetedData: Record<string, Map<string, number>> = {};

    // Fetch faceted counts for each column in parallel
    await Promise.all(
      facetedColumns.map(async (columnId) => {
        // Check if we need team data for filtering
        const needsTeamData =
          columnId === "premier_coach_id" ||
          filters.some((f) => f.columnId === "premier_coach_id");

        // For premier_coach_id, we need to fetch the premier coach data through team relationship
        let facetQuery = supabase.from("team_members").select(
          needsTeamData
            ? `team_id, team:coach_teams!team_members_team_id_fkey (
                id,
                premier_coach_id,
                premier_coach:team_members!coach_teams_premier_coach_id_fkey (
                  id,
                  name
                )
              )`
            : columnId,
          { count: "exact" }
        );

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
                case "name":
                case "email":
                  if (operator === "contains") {
                    facetQuery = facetQuery.ilike(
                      filterColumnId,
                      `%${values[0]}%`
                    );
                  } else if (operator === "does not contain") {
                    facetQuery = facetQuery.not(
                      filterColumnId,
                      "ilike",
                      `%${values[0]}%`
                    );
                  }
                  break;

                case "premier_coach_id":
                  // For premier_coach_id facet filtering, filter by premier coach ID
                  if (operator === "is") {
                    if (values.length === 1) {
                      facetQuery = facetQuery.filter("team.premier_coach_id", "eq", values[0]);
                    } else if (values.length > 1) {
                      facetQuery = facetQuery.filter("team.premier_coach_id", "in", `(${values.join(",")})`);
                    }
                  } else if (operator === "is not") {
                    if (values.length === 1) {
                      facetQuery = facetQuery.filter("team.premier_coach_id", "neq", values[0]);
                    } else if (values.length > 1) {
                      facetQuery = facetQuery.not("team.premier_coach_id", "in", `(${values.join(",")})`);
                    }
                  }
                  break;

                case "contract_type":
                case "created_at":
                  if (operator === "is") {
                    facetQuery = facetQuery.eq(filterColumnId, values[0]);
                  } else if (operator === "is not") {
                    facetQuery = facetQuery.not(
                      filterColumnId,
                      "eq",
                      values[0]
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
                      `${filterColumnId}.lt.${values[0]},${filterColumnId}.gt.${values[1]}`
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
            facetError
          );
          facetedData[columnId] = new Map();
          return;
        }

        // Convert to Map format
        const facetMap = new Map<string, number>();
        facetData?.forEach((item: any) => {
          if (columnId === "premier_coach_id") {
            // For premier_coach_id, use the premier coach ID as the facet key but we'll map names in the client
            const premierCoachId = item.team?.premier_coach_id;
            if (premierCoachId) {
              const key = String(premierCoachId);
              facetMap.set(key, (facetMap.get(key) || 0) + 1);
            }
          } else {
            const value = item[columnId];
            if (value) {
              const key = String(value);
              facetMap.set(key, (facetMap.get(key) || 0) + 1);
            }
          }
        });

        facetedData[columnId] = facetMap;
      })
    );
    return {
      coaches: coaches || [],
      totalCount: count || 0,
      facetedData,
    };
  } catch (error) {
    console.error("Unexpected error in getCoachesWithFaceted:", error);
    return {
      coaches: [],
      totalCount: 0,
      facetedData: {},
    };
  }
}

/**
 * Server-side wrapper that prefetches coaches with faceted counts.
 *
 * Calls getCoachesWithFaceted with the provided filters, pagination, sorting, and facet column list and returns the same result shape.
 *
 * @param filters - Array of filter objects applied to the query (e.g., text, date, and value filters).
 * @param page - Zero-based page index for pagination.
 * @param pageSize - Number of items per page.
 * @param sorting - Array describing sorting rules; if empty, defaults are applied by the underlying query.
 * @param facetedColumns - List of column identifiers to compute facet counts for (defaults to ["contract_type"]).
 * @returns An object with `{ coaches, totalCount, facetedData }` returned by getCoachesWithFaceted.
 */
export async function prefetchCoachesWithFacetedServer(
  filters: any[] = [],
  page = 0,
  pageSize = 25,
  sorting: any[] = [],
  facetedColumns: string[] = ["contract_type"]
) {
  return await getCoachesWithFaceted(
    filters,
    page,
    pageSize,
    sorting,
    facetedColumns
  );
}
