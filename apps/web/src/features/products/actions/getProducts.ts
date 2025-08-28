"use server";

import { createClient } from "@/utils/supabase/server";

export async function getProduct(id: string) {
	try {
		const supabase = await createClient();

		// Fetch product with related data
		const { data: product, error } = await supabase
			.from("products")
			.select("*")
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
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
) {
	try {
		const supabase = await createClient();

		let query = supabase.from("products").select("*", { count: "exact" });

		// Apply filters with proper operator support
		filters.forEach((filter) => {
			if (filter.values && filter.values.length > 0) {
				const values = filter.values;
				const operator = filter.operator || "is";
				const columnId = filter.columnId;

				// Apply filter based on column type and operator
				switch (columnId) {
					case "name":
					case "description":
						// Text fields - support contains/does not contain
						if (operator === "contains") {
							query = query.ilike(columnId, `%${values[0]}%`);
						} else if (operator === "does not contain") {
							query = query.not(columnId, "ilike", `%${values[0]}%`);
						}
						break;

					case "is_active":
						// Boolean field
						if (operator === "is") {
							query = query.eq(columnId, values[0] === "true");
						} else if (operator === "is not") {
							query = query.not(columnId, "eq", values[0] === "true");
						} else if (operator === "is any of") {
							const boolValues = values.map((v: string) => v === "true");
							query = query.in(columnId, boolValues);
						} else if (operator === "is none of") {
							const boolValues = values.map((v: string) => v === "true");
							query = query.not(columnId, "in", `(${boolValues.join(",")})`);
						}
						break;

					case "default_duration_months":
						// Number field
						if (operator === "is") {
							query = query.eq(columnId, Number.parseInt(values[0]));
						} else if (operator === "is not") {
							query = query.not(columnId, "eq", Number.parseInt(values[0]));
						} else if (operator === "is greater than") {
							query = query.gt(columnId, Number.parseInt(values[0]));
						} else if (operator === "is greater than or equal to") {
							query = query.gte(columnId, Number.parseInt(values[0]));
						} else if (operator === "is less than") {
							query = query.lt(columnId, Number.parseInt(values[0]));
						} else if (operator === "is less than or equal to") {
							query = query.lte(columnId, Number.parseInt(values[0]));
						} else if (operator === "is between" && values.length === 2) {
							query = query
								.gte(columnId, Number.parseInt(values[0]))
								.lte(columnId, Number.parseInt(values[1]));
						} else if (operator === "is not between" && values.length === 2) {
							query = query.or(
								`${columnId}.lt.${Number.parseInt(values[0])},${columnId}.gt.${Number.parseInt(values[1])}`,
							);
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
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
	facetedColumns: string[] = ["is_active"],
) {
	try {
		const supabase = await createClient();

		// Get main products data
		const productsResult = await getProductsWithFilters(
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
					.from("products")
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
								case "name":
								case "description":
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

								case "is_active":
									if (operator === "is") {
										facetQuery = facetQuery.eq(
											filterColumnId,
											values[0] === "true",
										);
									} else if (operator === "is not") {
										facetQuery = facetQuery.not(
											filterColumnId,
											"eq",
											values[0] === "true",
										);
									} else if (operator === "is any of") {
										const boolValues = values.map((v: string) => v === "true");
										facetQuery = facetQuery.in(filterColumnId, boolValues);
									} else if (operator === "is none of") {
										const boolValues = values.map((v: string) => v === "true");
										facetQuery = facetQuery.not(
											filterColumnId,
											"in",
											`(${boolValues.join(",")})`,
										);
									}
									break;

								case "default_duration_months":
									if (operator === "is") {
										facetQuery = facetQuery.eq(
											filterColumnId,
											Number.parseInt(values[0]),
										);
									} else if (operator === "is not") {
										facetQuery = facetQuery.not(
											filterColumnId,
											"eq",
											Number.parseInt(values[0]),
										);
									} else if (operator === "is greater than") {
										facetQuery = facetQuery.gt(
											filterColumnId,
											Number.parseInt(values[0]),
										);
									} else if (operator === "is greater than or equal to") {
										facetQuery = facetQuery.gte(
											filterColumnId,
											Number.parseInt(values[0]),
										);
									} else if (operator === "is less than") {
										facetQuery = facetQuery.lt(
											filterColumnId,
											Number.parseInt(values[0]),
										);
									} else if (operator === "is less than or equal to") {
										facetQuery = facetQuery.lte(
											filterColumnId,
											Number.parseInt(values[0]),
										);
									} else if (operator === "is between" && values.length === 2) {
										facetQuery = facetQuery
											.gte(filterColumnId, Number.parseInt(values[0]))
											.lte(filterColumnId, Number.parseInt(values[1]));
									} else if (
										operator === "is not between" &&
										values.length === 2
									) {
										facetQuery = facetQuery.or(
											`${filterColumnId}.lt.${Number.parseInt(values[0])},${filterColumnId}.gt.${Number.parseInt(values[1])}`,
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
	filters: any[] = [],
) {
	try {
		const supabase = await createClient();

		let query = supabase.from("products").select(columnId, { count: "exact" });

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
						case "description":
							if (operator === "contains") {
								query = query.ilike(filterColumnId, `%${values[0]}%`);
							} else if (operator === "does not contain") {
								query = query.not(filterColumnId, "ilike", `%${values[0]}%`);
							}
							break;

						case "is_active":
							if (operator === "is") {
								query = query.eq(filterColumnId, values[0] === "true");
							} else if (operator === "is not") {
								query = query.not(filterColumnId, "eq", values[0] === "true");
							} else if (operator === "is any of") {
								const boolValues = values.map((v: string) => v === "true");
								query = query.in(filterColumnId, boolValues);
							} else if (operator === "is none of") {
								const boolValues = values.map((v: string) => v === "true");
								query = query.not(
									filterColumnId,
									"in",
									`(${boolValues.join(",")})`,
								);
							}
							break;

						case "default_duration_months":
							if (operator === "is") {
								query = query.eq(filterColumnId, Number.parseInt(values[0]));
							} else if (operator === "is not") {
								query = query.not(
									filterColumnId,
									"eq",
									Number.parseInt(values[0]),
								);
							} else if (operator === "is greater than") {
								query = query.gt(filterColumnId, Number.parseInt(values[0]));
							} else if (operator === "is greater than or equal to") {
								query = query.gte(filterColumnId, Number.parseInt(values[0]));
							} else if (operator === "is less than") {
								query = query.lt(filterColumnId, Number.parseInt(values[0]));
							} else if (operator === "is less than or equal to") {
								query = query.lte(filterColumnId, Number.parseInt(values[0]));
							} else if (operator === "is between" && values.length === 2) {
								query = query
									.gte(filterColumnId, Number.parseInt(values[0]))
									.lte(filterColumnId, Number.parseInt(values[1]));
							} else if (operator === "is not between" && values.length === 2) {
								query = query.or(
									`${filterColumnId}.lt.${Number.parseInt(values[0])},${filterColumnId}.gt.${Number.parseInt(values[1])}`,
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
