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
		`
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

// Single consolidated function for coaches with faceted data
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

// Server-side prefetch for combined coaches+faceted data
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
