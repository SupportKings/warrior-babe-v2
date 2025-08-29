"use server";

import { createClient } from "@/utils/supabase/server";

// Helper function to get clients for filter options
export async function getClientsForFilter() {
  try {
    const supabase = await createClient();

    const { data: clients, error } = await supabase
      .from("clients")
      .select("id, name")
      .order("name");

    if (error) {
      console.error("Error fetching clients for filter:", error);
      return [];
    }

    return clients || [];
  } catch (error) {
    console.error("Unexpected error in getClientsForFilter:", error);
    return [];
  }
}

export async function getClientTestimonial(id: string) {
  try {
    const supabase = await createClient();

    // Fetch testimonial with related data
    const { data: testimonial, error } = await supabase
      .from("client_testimonials")
      .select(
        `
				*,
				client:clients!client_testimonials_client_id_clients_id_fk (
					id,
					name,
					email
				),
				recorded_by_user:user!client_testimonials_recorded_by_user_id_fk (
					id,
					name,
					email
				)
			`
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching client testimonial:", error);
      return null;
    }

    return testimonial;
  } catch (error) {
    console.error("Unexpected error in getClientTestimonial:", error);
    return null;
  }
}

export async function getClientTestimonialBasic(id: string) {
  try {
    const supabase = await createClient();

    const { data: testimonial, error } = await supabase
      .from("client_testimonials")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching client testimonial basic data:", error);
      return null;
    }

    return testimonial;
  } catch (error) {
    console.error("Unexpected error in getClientTestimonialBasic:", error);
    return null;
  }
}

export async function getAllClientTestimonials() {
  try {
    const supabase = await createClient();

    const { data: testimonials, error } = await supabase
      .from("client_testimonials")
      .select(
        `
				*,
				client:clients!client_testimonials_client_id_clients_id_fk (
					id,
					name,
					email
				),
				recorded_by_user:user!client_testimonials_recorded_by_user_id_fk (
					id,
					name,
					email
				)
			`
      )
      .order("recorded_date", { ascending: false });

    if (error) {
      console.error("Error fetching all client testimonials:", error);
      return [];
    }

    return testimonials || [];
  } catch (error) {
    console.error("Unexpected error in getAllClientTestimonials:", error);
    return [];
  }
}

// Enhanced function with filtering, pagination, and sorting
export async function getClientTestimonialsWithFilters(
  filters: any[] = [],
  page = 0,
  pageSize = 25,
  sorting: any[] = []
) {
  try {
    const supabase = await createClient();

    let query = supabase.from("client_testimonials").select(
      `
				*,
				client:clients!client_testimonials_client_id_clients_id_fk (
					id,
					name,
					email
				),
				recorded_by_user:user!client_testimonials_recorded_by_user_id_fk (
					id,
					name,
					email
				)
			`,
      { count: "exact" }
    );

    // Apply filters
    filters.forEach((filter) => {
      if (filter.values && filter.values.length > 0) {
        const values = filter.values;
        const operator = filter.operator || "is";
        const columnId = filter.columnId;

        // Apply filter based on column type and operator
        switch (columnId) {
          case "client_id":
            // Foreign key field - filter by client_id
            if (operator === "is") {
              query = query.eq(columnId, values[0]);
            } else if (operator === "is not") {
              query = query.neq(columnId, values[0]);
            } else if (operator === "is any of") {
              query = query.in(columnId, values);
            } else if (operator === "is none of") {
              query = query.not(columnId, "in", `(${values.join(",")})`);
            }
            break;

          case "testimonial_type":
            // Option field - support various operators
            if (operator === "is") {
              query = query.eq(columnId, values[0]);
            } else if (operator === "is not") {
              query = query.neq(columnId, values[0]);
            } else if (operator === "is any of") {
              query = query.in(columnId, values);
            } else if (operator === "is none of") {
              query = query.not(columnId, "in", `(${values.join(",")})`);
            }
            break;

          case "content":
            // Text field - support contains/does not contain
            if (operator === "contains") {
              query = query.ilike(columnId, `%${values[0]}%`);
            } else if (operator === "does not contain") {
              query = query.not(columnId, "ilike", `%${values[0]}%`);
            }
            break;

          case "recorded_date":
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
      sorting.forEach((sort) => {
        query = query.order(sort.id, { ascending: !sort.desc });
      });
    } else {
      query = query.order("recorded_date", { ascending: false });
    }

    // Apply pagination
    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching filtered client testimonials:", error);
      return { data: [], count: 0 };
    }

    return { data: data || [], count: count || 0 };
  } catch (error) {
    console.error(
      "Unexpected error in getClientTestimonialsWithFilters:",
      error
    );
    return { data: [], count: 0 };
  }
}

// Get faceted data for a specific column
export async function getClientTestimonialsFaceted(
  columnId: string,
  filters: any[] = []
) {
  try {
    const supabase = await createClient();

    let query = supabase.from("client_testimonials").select(columnId);

    // Apply filters (excluding the current column)
    filters
      .filter((f) => f.columnId !== columnId)
      .forEach((filter) => {
        if (filter.values && filter.values.length > 0) {
          const values = filter.values;
          const operator = filter.operator || "is";
          const filterId = filter.columnId;

          switch (filterId) {
            case "client_id":
              if (operator === "is") {
                query = query.eq(filterId, values[0]);
              } else if (operator === "is any of") {
                query = query.in(filterId, values);
              }
              break;
            case "testimonial_type":
              if (operator === "is") {
                query = query.eq(filterId, values[0]);
              } else if (operator === "is any of") {
                query = query.in(filterId, values);
              }
              break;
            case "content":
              if (operator === "contains") {
                query = query.ilike(filterId, `%${values[0]}%`);
              }
              break;
            case "recorded_date":
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

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching faceted data:", error);
      return [];
    }

    // Count occurrences of each value
    const facetedData = data?.reduce((acc: any, item: any) => {
      const value = item[columnId];
      if (value !== null && value !== undefined) {
        if (!acc[value]) {
          acc[value] = 0;
        }
        acc[value]++;
      }
      return acc;
    }, {});

    return Object.entries(facetedData || {}).map(([value, count]) => ({
      value,
      count,
    }));
  } catch (error) {
    console.error("Unexpected error in getClientTestimonialsFaceted:", error);
    return [];
  }
}

// Optimized combined query for table data with faceted data
export async function getClientTestimonialsWithFaceted(
  filters: any[] = [],
  page = 0,
  pageSize = 25,
  sorting: any[] = [],
  facetedColumns: string[] = ["testimonial_type"]
) {
  try {
    const supabase = await createClient();

    // Build base query
    let baseQuery = supabase.from("client_testimonials").select(
      `
				*,
				client:clients!client_testimonials_client_id_clients_id_fk (
					id,
					name,
					email
				),
				recorded_by_user:user!client_testimonials_recorded_by_user_id_fk (
					id,
					name,
					email
				)
			`,
      { count: "exact" }
    );

    // Apply filters
    filters.forEach((filter) => {
      if (filter.values && filter.values.length > 0) {
        const values = filter.values;
        const operator = filter.operator || "is";
        const columnId = filter.columnId;

        // Apply filter based on column type and operator
        switch (columnId) {
          case "client_id":
            if (operator === "is") {
              baseQuery = baseQuery.eq(columnId, values[0]);
            } else if (operator === "is not") {
              baseQuery = baseQuery.neq(columnId, values[0]);
            } else if (operator === "is any of") {
              baseQuery = baseQuery.in(columnId, values);
            } else if (operator === "is none of") {
              baseQuery = baseQuery.not(
                columnId,
                "in",
                `(${values.join(",")})`
              );
            }
            break;

          case "testimonial_type":
            if (operator === "is") {
              baseQuery = baseQuery.eq(columnId, values[0]);
            } else if (operator === "is not") {
              baseQuery = baseQuery.neq(columnId, values[0]);
            } else if (operator === "is any of") {
              baseQuery = baseQuery.in(columnId, values);
            } else if (operator === "is none of") {
              baseQuery = baseQuery.not(
                columnId,
                "in",
                `(${values.join(",")})`
              );
            }
            break;

          case "content":
            if (operator === "contains") {
              baseQuery = baseQuery.ilike(columnId, `%${values[0]}%`);
            } else if (operator === "does not contain") {
              baseQuery = baseQuery.not(columnId, "ilike", `%${values[0]}%`);
            }
            break;

          case "recorded_date":
          case "recorded_date":
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
              baseQuery = (baseQuery as any).eq(columnId, formattedValues[0]);
            } else if (operator === "is not") {
              baseQuery = (baseQuery as any).not(columnId, "eq", formattedValues[0]);
            } else if (operator === "is before") {
              baseQuery = (baseQuery as any).lt(columnId, formattedValues[0]);
            } else if (operator === "is on or before") {
              baseQuery = (baseQuery as any).lte(columnId, formattedValues[0]);
            } else if (operator === "is after") {
              baseQuery = (baseQuery as any).gt(columnId, formattedValues[0]);
            } else if (operator === "is on or after") {
              baseQuery = (baseQuery as any).gte(columnId, formattedValues[0]);
            } else if (
              operator === "is between" &&
              formattedValues.length === 2
            ) {
              baseQuery = (baseQuery as any)
                .gte(columnId, formattedValues[0])
                .lte(columnId, formattedValues[1]);
            } else if (operator === "is not between" && values.length === 2) {
              baseQuery = (baseQuery as any).or(
                `${columnId}.lt.${formattedValues[0]},${columnId}.gt.${formattedValues[1]}`
              );
            }
            break;
        }
      }
    });

    // Apply sorting
    if (sorting.length > 0) {
      sorting.forEach((sort) => {
        baseQuery = baseQuery.order(sort.id, { ascending: !sort.desc });
      });
    } else {
      baseQuery = baseQuery.order("recorded_date", { ascending: false });
    }

    // Apply pagination
    const from = page * pageSize;
    const to = from + pageSize - 1;
    baseQuery = baseQuery.range(from, to);

    // Execute main query
    const {
      data: testimonials,
      error: testimonialsError,
      count: totalCount,
    } = await baseQuery;

    if (testimonialsError) {
      console.error("Error fetching client testimonials:", testimonialsError);
      return { testimonials: [], totalCount: 0, facetedData: {} };
    }

    // Get faceted data for specified columns
    const facetedData: Record<string, any[]> = {};

    for (const column of facetedColumns) {
      let facetQuery = supabase.from("client_testimonials").select(column);

      // Apply same filters (excluding the current column for faceted data)
      filters
        .filter((f) => f.columnId !== column)
        .forEach((filter) => {
          if (filter.values && filter.values.length > 0) {
            const values = filter.values;
            const operator = filter.operator || "is";
            const columnId = filter.columnId;

            switch (columnId) {
              case "client_id":
                if (operator === "is") {
                  facetQuery = facetQuery.eq(columnId, values[0]);
                } else if (operator === "is any of") {
                  facetQuery = facetQuery.in(columnId, values);
                }
                break;
              case "testimonial_type":
                if (operator === "is") {
                  facetQuery = facetQuery.eq(columnId, values[0]);
                } else if (operator === "is any of") {
                  facetQuery = facetQuery.in(columnId, values);
                }
                break;
              case "content":
                if (operator === "contains") {
                  facetQuery = facetQuery.ilike(columnId, `%${values[0]}%`);
                }
                break;
              case "recorded_date":
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
                  facetQuery = (facetQuery as any).eq(columnId, formattedValues[0]);
                } else if (operator === "is not") {
                  facetQuery = (facetQuery as any).not(
                    columnId,
                    "eq",
                    formattedValues[0]
                  );
                } else if (operator === "is before") {
                  facetQuery = (facetQuery as any).lt(columnId, formattedValues[0]);
                } else if (operator === "is on or before") {
                  facetQuery = (facetQuery as any).lte(columnId, formattedValues[0]);
                } else if (operator === "is after") {
                  facetQuery = (facetQuery as any).gt(columnId, formattedValues[0]);
                } else if (operator === "is on or after") {
                  facetQuery = (facetQuery as any).gte(columnId, formattedValues[0]);
                } else if (
                  operator === "is between" &&
                  formattedValues.length === 2
                ) {
                  facetQuery = (facetQuery as any)
                    .gte(columnId, formattedValues[0])
                    .lte(columnId, formattedValues[1]);
                } else if (
                  operator === "is not between" &&
                  values.length === 2
                ) {
                  facetQuery = (facetQuery as any).or(
                    `${columnId}.lt.${formattedValues[0]},${columnId}.gt.${formattedValues[1]}`
                  );
                }
                break;
            }
          }
        });

      const { data: facetResult, error: facetError } = await facetQuery;

      if (facetError) {
        console.error(`Error fetching faceted data for ${column}:`, facetError);
        facetedData[column] = [];
      } else {
        // Count occurrences
        const counts = facetResult?.reduce((acc: any, item: any) => {
          const value = item[column];
          if (value !== null && value !== undefined) {
            if (!acc[value]) {
              acc[value] = 0;
            }
            acc[value]++;
          }
          return acc;
        }, {});

        facetedData[column] = Object.entries(counts || {}).map(
          ([value, count]) => ({
            value,
            count,
          })
        );
      }
    }

    // Get clients for filter options
    const clients = await getClientsForFilter();

    return {
      testimonials: testimonials || [],
      totalCount: totalCount || 0,
      facetedData,
      clients,
    };
  } catch (error) {
    console.error(
      "Unexpected error in getClientTestimonialsWithFaceted:",
      error
    );
    return { testimonials: [], totalCount: 0, facetedData: {}, clients: [] };
  }
}

// Server-side prefetch function
export async function prefetchClientTestimonialsWithFacetedServer(
  filters: any[] = [],
  page = 0,
  pageSize = 25,
  sorting: any[] = [],
  facetedColumns: string[] = ["testimonial_type"]
) {
  return getClientTestimonialsWithFaceted(
    filters,
    page,
    pageSize,
    sorting,
    facetedColumns
  );
}
