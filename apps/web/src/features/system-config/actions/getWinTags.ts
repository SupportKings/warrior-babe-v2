"use server";

import { createClient } from "@/utils/supabase/server";

export async function getWinTag(id: string) {
  try {
    const supabase = await createClient();

    const { data: winTag, error } = await supabase
      .from("win_tags")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching win tag:", error);
      return null;
    }

    return winTag;
  } catch (error) {
    console.error("Unexpected error in getWinTag:", error);
    return null;
  }
}

export async function getWinTagsWithFilters(
  filters: any[] = [],
  page = 0,
  pageSize = 25,
  sorting: any[] = []
) {
  try {
    const supabase = await createClient();

    let query = supabase.from("win_tags").select("*", { count: "exact" });

    // Apply filters with proper operator support
    filters.forEach((filter) => {
      if (filter.values && filter.values.length > 0) {
        const values = filter.values;
        const operator = filter.operator || "is";
        const columnId = filter.columnId;

        // Apply filter based on column type and operator
        switch (columnId) {
          case "name":
            // Text fields - support contains/does not contain
            if (operator === "contains") {
              query = query.ilike(columnId, `%${values[0]}%`);
            } else if (operator === "does not contain") {
              query = query.not(columnId, "ilike", `%${values[0]}%`);
            }
            break;

          case "color":
            // Option field - support various operators
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
            // Date fields - support various date operators
            if (operator === "is") {
              query = (query as any).eq(columnId, formattedValues[0]);
            } else if (operator === "is not") {
              query = (query as any).not(columnId, "eq", formattedValues[0]);
            } else if (operator === "is before") {
              query = (query as any).lt(columnId, formattedValues[0]);
            } else if (operator === "is on or before") {
              query = (query as any).lte(columnId, formattedValues[0]);
            } else if (operator === "is after") {
              query = (query as any).gt(columnId, formattedValues[0]);
            } else if (operator === "is on or after") {
              query = (query as any).gte(columnId, formattedValues[0]);
            } else if (
              operator === "is between" &&
              formattedValues.length === 2
            ) {
              query = (query as any)
                .gte(columnId, formattedValues[0])
                .lte(columnId, formattedValues[1]);
            } else if (operator === "is not between" && values.length === 2) {
              query = (query as any).or(
                `${columnId}.lt.${formattedValues[0]},${columnId}.gt.${formattedValues[1]}`
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
      console.error("Error fetching win tags with filters:", error);
      return { data: [], count: 0 };
    }

    return { data: data || [], count: count || 0 };
  } catch (error) {
    console.error("Unexpected error in getWinTagsWithFilters:", error);
    return { data: [], count: 0 };
  }
}

// Combined query for win tags with faceted data - optimized single call
export async function getWinTagsWithFaceted(
  filters: any[] = [],
  page = 0,
  pageSize = 25,
  sorting: any[] = [],
  facetedColumns: string[] = ["color"]
) {
  try {
    const supabase = await createClient();

    // Get main win tags data
    const winTagsResult = await getWinTagsWithFilters(
      filters,
      page,
      pageSize,
      sorting
    );

    // Get faceted data for each requested column
    const facetedData: Record<string, Map<string, number>> = {};

    // Fetch faceted counts for each column in parallel
    await Promise.all(
      facetedColumns.map(async (columnId) => {
        let facetQuery = supabase
          .from("win_tags")
          .select(columnId, { count: "exact" });

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

                case "color":
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
                  } else if (operator === "is") {
                    facetQuery = facetQuery.eq(filterColumnId, values[0]);
                  } else if (operator === "is not") {
                    facetQuery = facetQuery.not(
                      filterColumnId,
                      "eq",
                      values[0]
                    );
                  } else if (operator === "is any of") {
                    facetQuery = facetQuery.in(filterColumnId, values);
                  } else if (operator === "is none of") {
                    facetQuery = facetQuery.not(
                      filterColumnId,
                      "in",
                      `(${values.join(",")})`
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
          const value = item[columnId];
          if (value) {
            const key = String(value);
            facetMap.set(key, (facetMap.get(key) || 0) + 1);
          }
        });

        facetedData[columnId] = facetMap;
      })
    );

    return {
      winTags: winTagsResult.data,
      totalCount: winTagsResult.count,
      facetedData,
    };
  } catch (error) {
    console.error("Unexpected error in getWinTagsWithFaceted:", error);
    return {
      winTags: [],
      totalCount: 0,
      facetedData: {},
    };
  }
}

// Delete win tag
export async function deleteWinTag(id: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("win_tags").delete().eq("id", id);

    if (error) {
      console.error("Error deleting win tag:", error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error in deleteWinTag:", error);
    throw error;
  }
}

// Server-side prefetch functions for page-level prefetching
export async function prefetchWinTagsTableDataServer(
  filters: any[] = [],
  page = 0,
  pageSize = 25,
  sorting: any[] = []
) {
  return await getWinTagsWithFilters(filters, page, pageSize, sorting);
}

export async function prefetchWinTagsWithFacetedServer(
  filters: any[] = [],
  page = 0,
  pageSize = 25,
  sorting: any[] = [],
  facetedColumns: string[] = ["color"]
) {
  return await getWinTagsWithFaceted(
    filters,
    page,
    pageSize,
    sorting,
    facetedColumns
  );
}
