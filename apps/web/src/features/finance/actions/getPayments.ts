"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * Uses the 'payments_with_details' database view to fetch payments with client information
 * through the client_emails table relationship. The view joins:
 * payments -> client_emails -> clients to get client names properly.
 */

export async function getPayment(id: string) {
  try {
    const supabase = await createClient();

    // Fetch payment with related data from view - return raw view data
    const { data: row, error } = await supabase
      .from("payments_with_details")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching payment:", error);
      return null;
    }

    return row;
  } catch (error) {
    console.error("Unexpected error in getPayment:", error);
    return null;
  }
}

export async function getAllPayments() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("payments_with_details")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching payments:", error);
      return [];
    }

    // Return raw view data directly
    return data || [];
  } catch (error) {
    console.error("Unexpected error in getAllPayments:", error);
    return [];
  }
}

export async function getPaymentsWithFilters(
  filters: any[] = [],
  page = 0,
  pageSize = 25,
  sorting: any[] = []
) {
  try {
    const supabase = await createClient();

    // Use the view for simpler filtering
    let query = supabase
      .from("payments_with_details")
      .select("*", { count: "exact" });

    // Apply filters with proper operator support
    filters.forEach((filter) => {
      if (filter.values && filter.values.length > 0) {
        const values = filter.values;
        const operator = filter.operator || "is";
        const columnId = filter.columnId;

        // Apply filter based on column type and operator
        switch (columnId) {
          case "client_name":
            // Client filtering by name using text search
            if (operator === "contains") {
              query = (query as any).ilike(columnId, `%${values[0]}%`);
            } else if (operator === "does not contain") {
              query = (query as any).not(columnId, "ilike", `%${values[0]}%`);
            } else if (operator === "is") {
              query = (query as any).eq(columnId, values[0]);
            } else if (operator === "is not") {
              query = (query as any).not(columnId, "eq", values[0]);
            } else if (operator === "is any of") {
              query = (query as any).in(columnId, values);
            } else if (operator === "is none of") {
              query = (query as any).not(
                columnId,
                "in",
                `(${values.join(",")})`
              );
            }
            break;

          case "product_id":
            if (operator === "is") {
              query = (query as any).eq(columnId, values[0]);
            } else if (operator === "is not") {
              query = (query as any).not(columnId, "eq", values[0]);
            } else if (operator === "is any of") {
              query = (query as any).in(columnId, values);
            } else if (operator === "is none of") {
              query = (query as any).not(
                columnId,
                "in",
                `(${values.join(",")})`
              );
            }
            break;

          case "payment_method":
          case "stripe_transaction_id":
            // Text fields - support contains/does not contain
            if (operator === "contains") {
              query = (query as any).ilike(columnId, `%${values[0]}%`);
            } else if (operator === "does not contain") {
              query = (query as any).not(columnId, "ilike", `%${values[0]}%`);
            }
            break;

          case "status":
          case "platform":
          case "disputed_status":
            // Status can be treated as both text and option
            if (operator === "contains") {
              query = (query as any).ilike(columnId, `%${values[0]}%`);
            } else if (operator === "does not contain") {
              query = (query as any).not(columnId, "ilike", `%${values[0]}%`);
            } else if (operator === "is") {
              query = (query as any).eq(columnId, values[0]);
            } else if (operator === "is not") {
              query = (query as any).not(columnId, "eq", values[0]);
            } else if (operator === "is any of") {
              query = (query as any).in(columnId, values);
            } else if (operator === "is none of") {
              query = (query as any).not(
                columnId,
                "in",
                `(${values.join(",")})`
              );
            }
            break;

          case "payment_amount":
          case "dispute_fee": {
            // Number fields - convert string values to numbers
            const numValues = values.map((v: any) => {
              // Handle currency format (e.g., "$100", "100", "100.50", "$100.50")
              const cleanedValue = String(v).replace(/[$,]/g, "").trim();
              const num = Number.parseFloat(cleanedValue);
              
              // Check if the number is valid
              if (isNaN(num)) {
                console.warn(`Invalid number value for ${columnId}: ${v}`);
                return 0;
              }
              
              // Amount is stored as cents in DB (e.g., 499900 for $4999.00)
              // So we multiply by 100 to convert dollars to cents
              return Math.round(num * 100);
            });

            if (operator === "is") {
              query = (query as any).eq(columnId, numValues[0]);
            } else if (operator === "is not") {
              query = (query as any).not(columnId, "eq", numValues[0]);
            } else if (operator === "is greater than") {
              query = (query as any).gt(columnId, numValues[0]);
            } else if (operator === "is greater than or equal to") {
              query = (query as any).gte(columnId, numValues[0]);
            } else if (operator === "is less than") {
              query = (query as any).lt(columnId, numValues[0]);
            } else if (operator === "is less than or equal to") {
              query = (query as any).lte(columnId, numValues[0]);
            } else if (operator === "is between" && numValues.length === 2) {
              query = query
                .gte(columnId, Math.min(numValues[0], numValues[1]))
                .lte(columnId, Math.max(numValues[0], numValues[1]));
            }
            break;
          }

          case "payment_date":
          case "declined_at":
          case "created_at":
          case "updated_at": {
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
      const sort = sorting[0];
      query = (query as any).order(sort.id, { ascending: !sort.desc });
    } else {
      query = (query as any).order("created_at", { ascending: false });
    }

    // Apply pagination
    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = (query as any).range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching payments with filters:", error);
      return { data: [], count: 0 };
    }

    // Return raw view data directly
    return { data: data || [], count: count || 0 };
  } catch (error) {
    console.error("Unexpected error in getPaymentsWithFilters:", error);
    return { data: [], count: 0 };
  }
}

// Combined query for payments with faceted data - optimized single call
export async function getPaymentsWithFaceted(
  filters: any[] = [],
  page = 0,
  pageSize = 25,
  sorting: any[] = [],
  facetedColumns: string[] = ["status", "disputed_status", "platform"]
) {
  try {
    const supabase = await createClient();

    // Get main payments data
    const paymentsResult = await getPaymentsWithFilters(
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
          .from("payments")
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
                case "payment_method":
                case "stripe_transaction_id":
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

                case "status":
                case "platform":
                case "disputed_status":
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

                case "payment_amount":
                case "dispute_fee": {
                  // Number fields - convert string values to cents
                  const numValues = values.map((v: any) => {
                    // Handle currency format (e.g., "$100", "100", "100.50", "$100.50")
                    const cleanedValue = String(v).replace(/[$,]/g, "").trim();
                    const num = Number.parseFloat(cleanedValue);
                    
                    // Check if the number is valid
                    if (isNaN(num)) {
                      console.warn(`Invalid number value for ${filterColumnId}: ${v}`);
                      return 0;
                    }
                    
                    // Amount is stored as cents in DB (e.g., 499900 for $4999.00)
                    // So we multiply by 100 to convert dollars to cents
                    return Math.round(num * 100);
                  });

                  if (operator === "is") {
                    facetQuery = facetQuery.eq(filterColumnId, numValues[0]);
                  } else if (operator === "is not") {
                    facetQuery = facetQuery.not(
                      filterColumnId,
                      "eq",
                      numValues[0]
                    );
                  } else if (operator === "is greater than") {
                    facetQuery = facetQuery.gt(filterColumnId, numValues[0]);
                  } else if (operator === "is greater than or equal to") {
                    facetQuery = facetQuery.gte(filterColumnId, numValues[0]);
                  } else if (operator === "is less than") {
                    facetQuery = facetQuery.lt(filterColumnId, numValues[0]);
                  } else if (operator === "is less than or equal to") {
                    facetQuery = facetQuery.lte(filterColumnId, numValues[0]);
                  } else if (
                    operator === "is between" &&
                    numValues.length === 2
                  ) {
                    facetQuery = facetQuery
                      .gte(filterColumnId, Math.min(numValues[0], numValues[1]))
                      .lte(filterColumnId, Math.max(numValues[0], numValues[1]));
                  }
                  break;
                }

                case "payment_date":
                case "declined_at":
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
      payments: paymentsResult.data,
      totalCount: paymentsResult.count,
      facetedData,
    };
  } catch (error) {
    console.error("Unexpected error in getPaymentsWithFaceted:", error);
    return {
      payments: [],
      totalCount: 0,
      facetedData: {},
    };
  }
}

// Get all clients for filter dropdown
export async function getClientsForFilter() {
  try {
    const supabase = await createClient();

    const { data: clients, error } = await supabase
      .from("clients")
      .select("id, name")
      .order("name", { ascending: true });

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

// Search clients for filter - only fetch matching results
export async function searchClientsForFilter(searchTerm: string) {
  try {
    const supabase = await createClient();

    // Only search if there's a search term, limit to 50 results
    let query = supabase
      .from("clients")
      .select("id, name")
      .order("name", { ascending: true })
      .limit(50);

    if (searchTerm.trim()) {
      query = query.ilike("name", `%${searchTerm.trim()}%`);
    }

    const { data: clients, error } = await query;

    if (error) {
      console.error("Error searching clients for filter:", error);
      return [];
    }

    return clients || [];
  } catch (error) {
    console.error("Unexpected error in searchClientsForFilter:", error);
    return [];
  }
}

// Get all products for filter dropdown
export async function getProductsForFilter() {
  try {
    const supabase = await createClient();

    const { data: products, error } = await supabase
      .from("products")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching products for filter:", error);
      return [];
    }

    return products || [];
  } catch (error) {
    console.error("Unexpected error in getProductsForFilter:", error);
    return [];
  }
}

// Server-side prefetch for combined payments+faceted data
export async function prefetchPaymentsWithFacetedServer(
  filters: any[] = [],
  page = 0,
  pageSize = 25,
  sorting: any[] = [],
  facetedColumns: string[] = ["status", "disputed_status", "platform"]
) {
  return await getPaymentsWithFaceted(
    filters,
    page,
    pageSize,
    sorting,
    facetedColumns
  );
}
