"use server";

import { createClient } from "@/utils/supabase/server";

export async function getCoachPayment(id: string) {
  try {
    const supabase = await createClient();

    // Fetch coach payment with related data from the view
    const { data: coachPayment, error } = await supabase
      .from("coach_payments_list_view")
      .select("*")
      .eq("coach_payment_id", id)
      .single();

    if (error) {
      console.error("Error fetching coach payment:", error);
      return null;
    }

    return coachPayment;
  } catch (error) {
    console.error("Unexpected error in getCoachPayment:", error);
    return null;
  }
}

export async function getCoachPaymentBasic(id: string) {
  try {
    const supabase = await createClient();

    const { data: coachPayment, error } = await supabase
      .from("coach_payments")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching coach payment basic data:", error);
      return null;
    }

    return coachPayment;
  } catch (error) {
    console.error("Unexpected error in getCoachPaymentBasic:", error);
    return null;
  }
}

export async function getAllCoachPayments() {
  try {
    const supabase = await createClient();

    const { data: coachPayments, error } = await supabase
      .from("coach_payments_list_view")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching all coach payments:", error);
      return [];
    }

    return coachPayments || [];
  } catch (error) {
    console.error("Unexpected error in getAllCoachPayments:", error);
    return [];
  }
}

// Enhanced function with filtering, pagination, and sorting
export async function getCoachPaymentsWithFilters(
  filters: any[] = [],
  page = 0,
  pageSize = 25,
  sorting: any[] = []
) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("coach_payments_list_view")
      .select("*", { count: "exact" });

    // Apply filters
    filters.forEach((filter) => {
      if (filter.values && filter.values.length > 0) {
        const values = filter.values;
        const operator = filter.operator || "is";
        const columnId = filter.columnId;

        // Apply filter based on column type and operator
        switch (columnId) {
          case "coach_name":
            // Text fields - support contains/does not contain
            if (operator === "contains") {
              query = query.ilike(columnId, `%${values[0]}%`);
            } else if (operator === "does not contain") {
              query = query.not(columnId, "ilike", `%${values[0]}%`);
            }
            break;

          case "number_of_activity_periods":
            // Number field - support numeric operators
            const numValue = Number(values[0]);
            if (!isNaN(numValue)) {
              if (operator === "is") {
                query = query.eq(columnId, numValue);
              } else if (operator === "is not") {
                query = query.neq(columnId, numValue);
              } else if (operator === "is greater than") {
                query = query.gt(columnId, numValue);
              } else if (operator === "is less than") {
                query = query.lt(columnId, numValue);
              } else if (operator === "is greater than or equal to") {
                query = query.gte(columnId, numValue);
              } else if (operator === "is less than or equal to") {
                query = query.lte(columnId, numValue);
              } else if (operator === "is any of") {
                const numValues = values
                  .map((v: any) => Number(v))
                  .filter((v: number) => !isNaN(v));
                if (numValues.length > 0) {
                  query = query.in(columnId, numValues);
                }
              } else if (operator === "is none of") {
                const numValues = values
                  .map((v: any) => Number(v))
                  .filter((v: number) => !isNaN(v));
                if (numValues.length > 0) {
                  query = query.not(columnId, "in", `(${numValues.join(",")})`);
                }
              }
            }
            break;

          case "status":
            // Option field - support various operators
            if (operator === "contains") {
              query = query.ilike(columnId, `%${values[0]}%`);
            } else if (operator === "does not contain") {
              query = query.not(columnId, "ilike", `%${values[0]}%`);
            } else if (operator === "is") {
              query = query.eq(columnId, values[0]);
            } else if (operator === "is not") {
              query = query.neq(columnId, values[0]);
            } else if (operator === "is any of") {
              query = query.in(columnId, values);
            } else if (operator === "is none of") {
              query = query.not(columnId, "in", `(${values.join(",")})`);
            }
            break;
          case "date": {
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
      }
    });

    // Apply sorting
    if (sorting.length > 0) {
      sorting.forEach((sort) => {
        query = query.order(sort.id, { ascending: !sort.desc });
      });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    // Apply pagination
    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching filtered coach payments:", error);
      return { data: [], count: 0 };
    }

    return { data: data || [], count: count || 0 };
  } catch (error) {
    console.error("Unexpected error in getCoachPaymentsWithFilters:", error);
    return { data: [], count: 0 };
  }
}

// Get faceted data for a specific column
export async function getCoachPaymentsFaceted(
  columnId: string,
  filters: any[] = []
) {
  try {
    const supabase = await createClient();

    let query = supabase.from("coach_payments_list_view").select(columnId);

    // Apply filters (excluding the current column)
    filters.forEach((filter) => {
      if (filter.values && filter.values.length > 0) {
        const values = filter.values;
        const operator = filter.operator || "is";
        const columnId = filter.columnId;

        // Apply filter based on column type and operator
        switch (columnId) {
          case "coach_name":
            // Text fields - support contains/does not contain
            if (operator === "contains") {
              query = query.ilike(columnId, `%${values[0]}%`);
            } else if (operator === "does not contain") {
              query = query.not(columnId, "ilike", `%${values[0]}%`);
            }
            break;

          case "number_of_activity_periods":
            // Number field - support numeric operators
            const numValue = Number(values[0]);
            if (!isNaN(numValue)) {
              if (operator === "is") {
                query = query.eq(columnId, numValue);
              } else if (operator === "is not") {
                query = query.neq(columnId, numValue);
              } else if (operator === "is greater than") {
                query = query.gt(columnId, numValue);
              } else if (operator === "is less than") {
                query = query.lt(columnId, numValue);
              } else if (operator === "is greater than or equal to") {
                query = query.gte(columnId, numValue);
              } else if (operator === "is less than or equal to") {
                query = query.lte(columnId, numValue);
              } else if (operator === "is any of") {
                const numValues = values
                  .map((v: any) => Number(v))
                  .filter((v: number) => !isNaN(v));
                if (numValues.length > 0) {
                  query = query.in(columnId, numValues);
                }
              } else if (operator === "is none of") {
                const numValues = values
                  .map((v: any) => Number(v))
                  .filter((v: number) => !isNaN(v));
                if (numValues.length > 0) {
                  query = query.not(columnId, "in", `(${numValues.join(",")})`);
                }
              }
            }
            break;

          case "status":
            // Option field - support various operators
            if (operator === "contains") {
              query = query.ilike(columnId, `%${values[0]}%`);
            } else if (operator === "does not contain") {
              query = query.not(columnId, "ilike", `%${values[0]}%`);
            } else if (operator === "is") {
              query = query.eq(columnId, values[0]);
            } else if (operator === "is not") {
              query = query.neq(columnId, values[0]);
            } else if (operator === "is any of") {
              query = query.in(columnId, values);
            } else if (operator === "is none of") {
              query = query.not(columnId, "in", `(${values.join(",")})`);
            }
            break;
          case "date": {
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
    console.error("Unexpected error in getCoachPaymentsFaceted:", error);
    return [];
  }
}

// Optimized combined query for table data with faceted data
export async function getCoachPaymentsWithFaceted(
  filters: any[] = [],
  page = 0,
  pageSize = 25,
  sorting: any[] = [],
  facetedColumns: string[] = ["status"]
) {
  try {
    const supabase = await createClient();

    // Build base query
    let baseQuery = supabase
      .from("coach_payments_list_view")
      .select("*", { count: "exact" });

    // Apply filters
    filters.forEach((filter) => {
      if (filter.values && filter.values.length > 0) {
        const values = filter.values;
        const operator = filter.operator || "is";
        const columnId = filter.columnId;

        // Apply filter based on column type and operator
        switch (columnId) {
          case "coach_name":
            // Text fields - support contains/does not contain
            if (operator === "contains") {
              baseQuery = baseQuery.ilike(columnId, `%${values[0]}%`);
            } else if (operator === "does not contain") {
              baseQuery = baseQuery.not(columnId, "ilike", `%${values[0]}%`);
            }
            break;

          case "number_of_activity_periods":
            // Number field - support numeric operators
            const numValue = Number(values[0]);
            if (!isNaN(numValue)) {
              if (operator === "is") {
                baseQuery = baseQuery.eq(columnId, numValue);
              } else if (operator === "is not") {
                baseQuery = baseQuery.neq(columnId, numValue);
              } else if (operator === "is greater than") {
                baseQuery = baseQuery.gt(columnId, numValue);
              } else if (operator === "is less than") {
                baseQuery = baseQuery.lt(columnId, numValue);
              } else if (operator === "is greater than or equal to") {
                baseQuery = baseQuery.gte(columnId, numValue);
              } else if (operator === "is less than or equal to") {
                baseQuery = baseQuery.lte(columnId, numValue);
              } else if (operator === "is any of") {
                const numValues = values
                  .map((v: any) => Number(v))
                  .filter((v: number) => !isNaN(v));
                if (numValues.length > 0) {
                  baseQuery = baseQuery.in(columnId, numValues);
                }
              } else if (operator === "is none of") {
                const numValues = values
                  .map((v: any) => Number(v))
                  .filter((v: number) => !isNaN(v));
                if (numValues.length > 0) {
                  baseQuery = baseQuery.not(
                    columnId,
                    "in",
                    `(${numValues.join(",")})`
                  );
                }
              }
            }
            break;

          case "status":
            if (operator === "contains") {
              baseQuery = baseQuery.ilike(columnId, `%${values[0]}%`);
            } else if (operator === "does not contain") {
              baseQuery = baseQuery.not(columnId, "ilike", `%${values[0]}%`);
            } else if (operator === "is") {
              baseQuery = baseQuery.eq(columnId, values[0]);
            } else if (operator === "is not") {
              baseQuery = baseQuery.not(columnId, "eq", values[0]);
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
          case "date": {
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
              baseQuery = (baseQuery as any).not(
                columnId,
                "eq",
                formattedValues[0]
              );
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
      }
    });

    // Apply sorting
    if (sorting.length > 0) {
      sorting.forEach((sort) => {
        baseQuery = baseQuery.order(sort.id, { ascending: !sort.desc });
      });
    } else {
      baseQuery = baseQuery.order("created_at", { ascending: false });
    }

    // Apply pagination
    const from = page * pageSize;
    const to = from + pageSize - 1;
    baseQuery = baseQuery.range(from, to);

    // Execute main query
    const {
      data: coachPayments,
      error: paymentsError,
      count: totalCount,
    } = await baseQuery;

    if (paymentsError) {
      console.error("Error fetching coach payments:", paymentsError);
      return { coachPayments: [], totalCount: 0, facetedData: {} };
    }

    // Get faceted data for specified columns
    const facetedData: Record<string, any[]> = {};

    for (const column of facetedColumns) {
      let facetQuery = supabase.from("coach_payments_list_view").select(column);

      // Apply same filters (excluding the current column for faceted data)
      filters.forEach((filter) => {
        if (filter.values && filter.values.length > 0) {
          const values = filter.values;
          const operator = filter.operator || "is";
          const columnId = filter.columnId;

          // Apply filter based on column type and operator
          switch (columnId) {
            case "coach_name":
              // Text fields - support contains/does not contain
              if (operator === "contains") {
                facetQuery = facetQuery.ilike(columnId, `%${values[0]}%`);
              } else if (operator === "does not contain") {
                facetQuery = facetQuery.not(
                  columnId,
                  "ilike",
                  `%${values[0]}%`
                );
              }
              break;

            case "number_of_activity_periods":
              // Number field - support numeric operators
              const numValue = Number(values[0]);
              if (!isNaN(numValue)) {
                if (operator === "is") {
                  facetQuery = facetQuery.eq(columnId, numValue);
                } else if (operator === "is not") {
                  facetQuery = facetQuery.neq(columnId, numValue);
                } else if (operator === "is greater than") {
                  facetQuery = facetQuery.gt(columnId, numValue);
                } else if (operator === "is less than") {
                  facetQuery = facetQuery.lt(columnId, numValue);
                } else if (operator === "is greater than or equal to") {
                  facetQuery = facetQuery.gte(columnId, numValue);
                } else if (operator === "is less than or equal to") {
                  facetQuery = facetQuery.lte(columnId, numValue);
                } else if (operator === "is any of") {
                  const numValues = values
                    .map((v: any) => Number(v))
                    .filter((v: number) => !isNaN(v));
                  if (numValues.length > 0) {
                    facetQuery = facetQuery.in(columnId, numValues);
                  }
                } else if (operator === "is none of") {
                  const numValues = values
                    .map((v: any) => Number(v))
                    .filter((v: number) => !isNaN(v));
                  if (numValues.length > 0) {
                    facetQuery = facetQuery.not(
                      columnId,
                      "in",
                      `(${numValues.join(",")})`
                    );
                  }
                }
              }
              break;

            case "status":
              if (operator === "contains") {
                facetQuery = facetQuery.ilike(columnId, `%${values[0]}%`);
              } else if (operator === "does not contain") {
                facetQuery = facetQuery.not(
                  columnId,
                  "ilike",
                  `%${values[0]}%`
                );
              } else if (operator === "is") {
                facetQuery = facetQuery.eq(columnId, values[0]);
              } else if (operator === "is not") {
                facetQuery = facetQuery.not(columnId, "eq", values[0]);
              } else if (operator === "is any of") {
                facetQuery = facetQuery.in(columnId, values);
              } else if (operator === "is none of") {
                facetQuery = facetQuery.not(
                  columnId,
                  "in",
                  `(${values.join(",")})`
                );
              }
              break;
            case "date":
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
                facetQuery = (facetQuery as any).eq(
                  columnId,
                  formattedValues[0]
                );
              } else if (operator === "is not") {
                facetQuery = (facetQuery as any).not(
                  columnId,
                  "eq",
                  formattedValues[0]
                );
              } else if (operator === "is before") {
                facetQuery = (facetQuery as any).lt(
                  columnId,
                  formattedValues[0]
                );
              } else if (operator === "is on or before") {
                facetQuery = (facetQuery as any).lte(
                  columnId,
                  formattedValues[0]
                );
              } else if (operator === "is after") {
                facetQuery = (facetQuery as any).gt(
                  columnId,
                  formattedValues[0]
                );
              } else if (operator === "is on or after") {
                facetQuery = (facetQuery as any).gte(
                  columnId,
                  formattedValues[0]
                );
              } else if (
                operator === "is between" &&
                formattedValues.length === 2
              ) {
                facetQuery = (facetQuery as any)
                  .gte(columnId, formattedValues[0])
                  .lte(columnId, formattedValues[1]);
              } else if (operator === "is not between" && values.length === 2) {
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

    return {
      coachPayments: coachPayments || [],
      totalCount: totalCount || 0,
      facetedData,
    };
  } catch (error) {
    console.error("Unexpected error in getCoachPaymentsWithFaceted:", error);
    return { coachPayments: [], totalCount: 0, facetedData: {} };
  }
}

// Server-side prefetch function
export async function prefetchCoachPaymentsWithFacetedServer(
  filters: any[] = [],
  page = 0,
  pageSize = 25,
  sorting: any[] = [],
  facetedColumns: string[] = ["status"]
) {
  return getCoachPaymentsWithFaceted(
    filters,
    page,
    pageSize,
    sorting,
    facetedColumns
  );
}
