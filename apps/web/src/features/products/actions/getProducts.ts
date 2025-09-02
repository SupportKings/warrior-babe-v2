"use server";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

// Zod schemas for type safety
const FilterSchema = z.object({
	columnId: z.string(),
	operator: z.string().optional().default("is"),
	values: z.array(z.unknown()),
});

const SortingSchema = z.object({
	id: z.string(),
	desc: z.boolean().optional().default(false),
});

// TypeScript types derived from schemas
type Filter = z.infer<typeof FilterSchema>;
type Sorting = z.infer<typeof SortingSchema>;

// Shared helper function to apply filters to a query
function applyProductFilters(
	query: any,
	filters: Filter[],
	excludeColumnId?: string,
) {
	let filteredQuery = query;

	filters.forEach((filter) => {
		// Skip if this column should be excluded or if no values
		if (
			filter.columnId === excludeColumnId ||
			!filter.values ||
			filter.values.length === 0
		) {
			return;
		}

		const { columnId, operator = "is", values } = filter;

		// Apply filter based on column type and operator
		switch (columnId) {
			case "name":
			case "description":
				// Text fields - support contains/does not contain
				if (operator === "contains") {
					filteredQuery = filteredQuery.ilike(
						columnId,
						`%${String(values[0])}%`,
					);
				} else if (operator === "does not contain") {
					filteredQuery = filteredQuery.not(
						columnId,
						"ilike",
						`%${String(values[0])}%`,
					);
				}
				break;

			case "is_active":
				// Boolean field
				if (operator === "is") {
					filteredQuery = filteredQuery.eq(
						columnId,
						String(values[0]) === "true",
					);
				} else if (operator === "is not") {
					filteredQuery = filteredQuery.not(
						columnId,
						"eq",
						String(values[0]) === "true",
					);
				} else if (operator === "is any of") {
					const boolValues = values.map((v) => String(v) === "true");
					filteredQuery = filteredQuery.in(columnId, boolValues);
				} else if (operator === "is none of") {
					const boolValues = values.map((v) => String(v) === "true");
					filteredQuery = filteredQuery.not(
						columnId,
						"in",
						`(${boolValues.join(",")})`,
					);
				}
				break;

			case "default_duration_months":
				// Number field
				if (operator === "is") {
					filteredQuery = filteredQuery.eq(
						columnId,
						Number.parseInt(String(values[0])),
					);
				} else if (operator === "is not") {
					filteredQuery = filteredQuery.not(
						columnId,
						"eq",
						Number.parseInt(String(values[0])),
					);
				} else if (operator === "is greater than") {
					filteredQuery = filteredQuery.gt(
						columnId,
						Number.parseInt(String(values[0])),
					);
				} else if (operator === "is greater than or equal to") {
					filteredQuery = filteredQuery.gte(
						columnId,
						Number.parseInt(String(values[0])),
					);
				} else if (operator === "is less than") {
					filteredQuery = filteredQuery.lt(
						columnId,
						Number.parseInt(String(values[0])),
					);
				} else if (operator === "is less than or equal to") {
					filteredQuery = filteredQuery.lte(
						columnId,
						Number.parseInt(String(values[0])),
					);
				} else if (operator === "is between" && values.length === 2) {
					filteredQuery = filteredQuery
						.gte(columnId, Number.parseInt(String(values[0])))
						.lte(columnId, Number.parseInt(String(values[1])));
				} else if (operator === "is not between" && values.length === 2) {
					filteredQuery = filteredQuery.or(
						`${columnId}.lt.${Number.parseInt(String(values[0]))},${columnId}.gt.${Number.parseInt(String(values[1]))}`,
					);
				}
				break;

			case "created_at":
			case "updated_at":
				// Date fields - support various date operators
				if (operator === "is") {
					filteredQuery = filteredQuery.eq(columnId, String(values[0]));
				} else if (operator === "is not") {
					filteredQuery = filteredQuery.not(columnId, "eq", String(values[0]));
				} else if (operator === "is before") {
					filteredQuery = filteredQuery.lt(columnId, String(values[0]));
				} else if (operator === "is on or before") {
					filteredQuery = filteredQuery.lte(columnId, String(values[0]));
				} else if (operator === "is after") {
					filteredQuery = filteredQuery.gt(columnId, String(values[0]));
				} else if (operator === "is on or after") {
					filteredQuery = filteredQuery.gte(columnId, String(values[0]));
				} else if (operator === "is between" && values.length === 2) {
					filteredQuery = filteredQuery
						.gte(columnId, String(values[0]))
						.lte(columnId, String(values[1]));
				} else if (operator === "is not between" && values.length === 2) {
					filteredQuery = filteredQuery.or(
						`${columnId}.lt.${String(values[0])},${columnId}.gt.${String(values[1])}`,
					);
				}
				break;
		}
	});

	return filteredQuery;
}

export async function getProduct(id: string) {
	try {
		const supabase = await createClient();

		// Fetch product with related payment plan templates
		const { data: product, error } = await supabase
			.from("products")
			.select(`
				*,
				payment_plan_templates (
					*,
					payment_plan_template_slots (
						*
					)
				)
			`)
			.eq("id", id)
			.single();

		if (error) {
			console.error("Error fetching product:", error);
			return null;
		}

		return product;
	} catch (error) {
		console.error("Unexpected error in getProduct:", error);
		return null;
	}
}

export async function getProductBasic(id: string) {
	try {
		const supabase = await createClient();

		const { data: product, error } = await supabase
			.from("products")
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			console.error("Error fetching product basic data:", error);
			return null;
		}

		return product;
	} catch (error) {
		console.error("Unexpected error in getProductBasic:", error);
		return null;
	}
}

export async function getAllProducts() {
	try {
		const supabase = await createClient();

		const { data: products, error } = await supabase
			.from("products")
			.select("*")
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching products:", error);
			return [];
		}

		return products || [];
	} catch (error) {
		console.error("Unexpected error in getAllProducts:", error);
		return [];
	}
}

export async function getProductsWithFilters(
	filters: Filter[] = [],
	page = 0,
	pageSize = 25,
	sorting: Sorting[] = [],
) {
	try {
		// Validate and parse input parameters
		const validatedFilters = z.array(FilterSchema).parse(filters);
		const validatedSorting = z.array(SortingSchema).parse(sorting);

		const supabase = await createClient();

		let query = supabase.from("products").select("*", { count: "exact" });

		// Apply filters using the shared helper
		query = applyProductFilters(query, validatedFilters);

		// Apply sorting
		if (validatedSorting.length > 0) {
			const sort = validatedSorting[0];
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
			console.error("Error fetching products with filters:", error);
			return { data: [], count: 0 };
		}

		return { data: data || [], count: count || 0 };
	} catch (error) {
		console.error("Unexpected error in getProductsWithFilters:", error);
		return { data: [], count: 0 };
	}
}

// Combined query for products with faceted data - optimized single call
export async function getProductsWithFaceted(
	filters: Filter[] = [],
	page = 0,
	pageSize = 25,
	sorting: Sorting[] = [],
	facetedColumns: string[] = ["is_active"],
) {
	try {
		// Validate and parse input parameters
		const validatedFilters = z.array(FilterSchema).parse(filters);
		const validatedSorting = z.array(SortingSchema).parse(sorting);

		const supabase = await createClient();

		// Get main products data
		const productsResult = await getProductsWithFilters(
			validatedFilters,
			page,
			pageSize,
			validatedSorting,
		);

		// Get faceted data for each requested column
		const facetedData: Record<string, Map<string, number>> = {};

		// Fetch faceted counts for each column in parallel
		await Promise.all(
			facetedColumns.map(async (columnId) => {
				let facetQuery = supabase
					.from("products")
					.select(columnId, { count: "exact" });

				// Apply existing filters (excluding the column we're faceting) using shared helper
				facetQuery = applyProductFilters(
					facetQuery,
					validatedFilters,
					columnId,
				);

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
					if (value !== null && value !== undefined) {
						const key = String(value);
						facetMap.set(key, (facetMap.get(key) || 0) + 1);
					}
				});

				facetedData[columnId] = facetMap;
			}),
		);

		return {
			products: productsResult.data,
			totalCount: productsResult.count,
			facetedData,
		};
	} catch (error) {
		console.error("Unexpected error in getProductsWithFaceted:", error);
		return {
			products: [],
			totalCount: 0,
			facetedData: {},
		};
	}
}

export async function getProductsFaceted(
	columnId: string,
	filters: Filter[] = [],
) {
	try {
		// Validate and parse input parameters
		const validatedFilters = z.array(FilterSchema).parse(filters);

		const supabase = await createClient();

		let query = supabase.from("products").select(columnId, { count: "exact" });

		// Apply existing filters (excluding the column we're faceting) using shared helper
		query = applyProductFilters(query, validatedFilters, columnId);

		const { data, error } = await query;

		if (error) {
			console.error("Error fetching faceted data:", error);
			return new Map<string, number>();
		}

		// Convert to Map format
		const facetedMap = new Map<string, number>();
		data?.forEach((item: any) => {
			const value = item[columnId];
			if (value !== null && value !== undefined) {
				const key = String(value);
				facetedMap.set(key, (facetedMap.get(key) || 0) + 1);
			}
		});

		return facetedMap;
	} catch (error) {
		console.error("Unexpected error in getProductsFaceted:", error);
		return new Map<string, number>();
	}
}

// Server-side prefetch functions for page-level prefetching
export async function prefetchProductsTableDataServer(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
) {
	return await getProductsWithFilters(filters, page, pageSize, sorting);
}

export async function prefetchProductsFacetedServer(
	columnId: string,
	filters: any[] = [],
) {
	return await getProductsFaceted(columnId, filters);
}

// Server-side prefetch for combined products+faceted data
export async function prefetchProductsWithFacetedServer(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
	facetedColumns: string[] = ["is_active"],
) {
	return await getProductsWithFaceted(
		filters,
		page,
		pageSize,
		sorting,
		facetedColumns,
	);
}
