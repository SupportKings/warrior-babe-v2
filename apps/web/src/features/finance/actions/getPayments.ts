"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * IMPORTANT: This file is configured to use a database view called 'payments_with_details'
 * which needs to be created in Supabase first. Run the SQL in payments_view.sql
 * to create the view. Until then, the code uses 'as any' to bypass TypeScript checks.
 *
 * The view simplifies filtering by client_id and product_id by flattening the
 * payment -> payment_slots -> payment_plans -> clients/products relationship.
 */

export async function getPayment(id: string) {
	try {
		const supabase = await createClient();

		// Fetch payment with related data from view
		const { data: row, error } = await supabase
			.from("payments_with_details") // Using 'as any' temporarily until view is created
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			console.error("Error fetching payment:", error);
			return null;
		}

		if (!row) return null;

		// Transform to nested structure
		const payment = {
			id: row.id,
			amount: row.amount,
			payment_date: row.payment_date,
			payment_method: row.payment_method,
			stripe_transaction_id: row.stripe_transaction_id,
			status: row.status,
			platform: row.platform,
			declined_at: row.declined_at,
			disputed_status: row.disputed_status,
			dispute_fee: row.dispute_fee,
			created_at: row.created_at,
			updated_at: row.updated_at,
			payment_slots: row.payment_slot_id
				? [
						{
							id: row.payment_slot_id,
							amount_due: row.amount_due,
							amount_paid: row.amount_paid,
							due_date: row.slot_due_date,
							notes: row.slot_notes,
							plan_id: row.payment_plan_id,
							payment_plans: row.payment_plan_id
								? {
										id: row.payment_plan_id,
										name: row.payment_plan_name,
										platform: row.plan_platform,
										product_id: row.product_id,
										client_id: row.client_id,
										total_amount: row.plan_total_amount,
										type: row.plan_type,
										clients: row.client_id
											? {
													id: row.client_id,
													name: row.client_name,
													email: row.client_email,
												}
											: null,
										products: row.product_id
											? {
													id: row.product_id,
													name: row.product_name,
												}
											: null,
									}
								: null,
						},
					]
				: [],
		};

		return payment;
	} catch (error) {
		console.error("Unexpected error in getPayment:", error);
		return null;
	}
}

export async function getAllPayments() {
	try {
		const supabase = await createClient();

		const { data, error } = await supabase
			.from("payments_with_details" as any) // Using 'as any' temporarily until view is created
			.select("*")
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching payments:", error);
			return [];
		}

		// Transform the flat view data back to nested structure
		const payments =
			data?.map((row: any) => ({
				id: row.id,
				amount: row.amount,
				payment_date: row.payment_date,
				payment_method: row.payment_method,
				stripe_transaction_id: row.stripe_transaction_id,
				status: row.status,
				platform: row.platform,
				declined_at: row.declined_at,
				disputed_status: row.disputed_status,
				dispute_fee: row.dispute_fee,
				created_at: row.created_at,
				updated_at: row.updated_at,
				payment_slots: row.payment_slot_id
					? [
							{
								id: row.payment_slot_id,
								amount_due: row.amount_due,
								amount_paid: row.amount_paid,
								due_date: row.slot_due_date,
								notes: row.slot_notes,
								plan_id: row.payment_plan_id,
								payment_plans: row.payment_plan_id
									? {
											id: row.payment_plan_id,
											name: row.payment_plan_name,
											platform: row.plan_platform,
											product_id: row.product_id,
											client_id: row.client_id,
											clients: row.client_id
												? {
														id: row.client_id,
														name: row.client_name,
														email: row.client_email,
													}
												: null,
											products: row.product_id
												? {
														id: row.product_id,
														name: row.product_name,
													}
												: null,
										}
									: null,
							},
						]
					: [],
			})) || [];

		return payments;
	} catch (error) {
		console.error("Unexpected error in getAllPayments:", error);
		return [];
	}
}

export async function getPaymentsWithFilters(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
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
					case "client_id":
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
								`(${values.join(",")})`,
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
								`(${values.join(",")})`,
							);
						}
						break;

					case "amount":
					case "dispute_fee": {
						// Number fields - convert string values to numbers
						const numValues = values.map((v: any) => {
							// Handle currency format (e.g., "100" or "100.50")
							const num = Number.parseFloat(String(v).replace(/[^0-9.-]/g, ""));
							// Amount is stored as whole numbers in DB (e.g., 4999 for $4999)
							return Math.round(num);
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
								.gte(columnId, numValues[0])
								.lte(columnId, numValues[1]);
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
								`${columnId}.lt.${formattedValues[0]},${columnId}.gt.${formattedValues[1]}`,
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

		// Transform the flat view data back to nested structure
		const transformedData =
			data?.map((row: any) => ({
				// Base payment fields
				id: row.id,
				amount: row.amount,
				payment_date: row.payment_date,
				payment_method: row.payment_method,
				stripe_transaction_id: row.stripe_transaction_id,
				status: row.status,
				platform: row.platform,
				declined_at: row.declined_at,
				disputed_status: row.disputed_status,
				dispute_fee: row.dispute_fee,
				created_at: row.created_at,
				updated_at: row.updated_at,

				// Nested structure for compatibility with existing UI
				payment_slots: row.payment_slot_id
					? [
							{
								id: row.payment_slot_id,
								amount_due: row.amount_due,
								amount_paid: row.amount_paid,
								due_date: row.slot_due_date,
								notes: row.slot_notes,
								plan_id: row.payment_plan_id,
								payment_plans: row.payment_plan_id
									? {
											id: row.payment_plan_id,
											name: row.payment_plan_name,
											platform: row.plan_platform,
											product_id: row.product_id,
											client_id: row.client_id,
											total_amount: row.plan_total_amount,
											type: row.plan_type,
											clients: row.client_id
												? {
														id: row.client_id,
														name: row.client_name,
														email: row.client_email,
													}
												: null,
											products: row.product_id
												? {
														id: row.product_id,
														name: row.product_name,
													}
												: null,
										}
									: null,
							},
						]
					: [],
			})) || [];

		return { data: transformedData, count: count || 0 };
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
	facetedColumns: string[] = ["status", "disputed_status", "platform"],
) {
	try {
		const supabase = await createClient();

		// Get main payments data
		const paymentsResult = await getPaymentsWithFilters(
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

								case "status":
								case "platform":
								case "disputed_status":
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
									} else if (operator === "is") {
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

								case "amount":
								case "dispute_fee": {
									// Number fields - convert string values to numbers
									const numValues = values.map((v: any) => {
										// Handle currency format (e.g., "100" or "100.50")
										const num = Number.parseFloat(
											String(v).replace(/[^0-9.-]/g, ""),
										);
										// Amount is stored as whole numbers in DB (e.g., 4999 for $4999)
										return Math.round(num);
									});

									if (operator === "is") {
										facetQuery = facetQuery.eq(filterColumnId, numValues[0]);
									} else if (operator === "is not") {
										facetQuery = facetQuery.not(
											filterColumnId,
											"eq",
											numValues[0],
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
											.gte(filterColumnId, numValues[0])
											.lte(filterColumnId, numValues[1]);
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
					if (value) {
						const key = String(value);
						facetMap.set(key, (facetMap.get(key) || 0) + 1);
					}
				});

				facetedData[columnId] = facetMap;
			}),
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
	facetedColumns: string[] = ["status", "disputed_status", "platform"],
) {
	return await getPaymentsWithFaceted(
		filters,
		page,
		pageSize,
		sorting,
		facetedColumns,
	);
}
