// Example of how to use the payments_with_details view in your getPayments.ts file

// Replace the current query with:
export async function getPaymentsWithFilters(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
) {
	try {
		const supabase = await createClient();

		// Use the view instead of complex joins
		let query = supabase.from("payments_with_details").select(
			`*`,
			{ count: "exact" },
		);

		// Apply filters
		filters.forEach((filter) => {
			if (filter.values && filter.values.length > 0) {
				const values = filter.values;
				const operator = filter.operator || "is";
				const columnId = filter.columnId;

				switch (columnId) {
					// Now client_id and product_id are direct columns in the view
					case "client_id":
					case "product_id":
						if (operator === "is") {
							query = query.eq(columnId, values[0]);
						} else if (operator === "is not") {
							query = query.not(columnId, "eq", values[0]);
						} else if (operator === "is any of") {
							query = query.in(columnId, values);
						} else if (operator === "is none of") {
							query = query.not(columnId, "in", `(${values.join(",")})`);
						}
						break;
					
					// ... rest of your filter cases
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
			console.error("Error fetching payments with filters:", error);
			return { data: [], count: 0 };
		}

		// Transform the data to match the expected format
		const transformedData = data?.map(row => ({
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
			
			// Nested structure for compatibility with existing code
			payment_slots: row.payment_slot_id ? [{
				id: row.payment_slot_id,
				amount_due: row.amount_due,
				amount_paid: row.amount_paid,
				due_date: row.slot_due_date,
				notes: row.slot_notes,
				plan_id: row.payment_plan_id,
				payment_plans: row.payment_plan_id ? {
					id: row.payment_plan_id,
					name: row.payment_plan_name,
					platform: row.plan_platform,
					product_id: row.product_id,
					client_id: row.client_id,
					total_amount: row.plan_total_amount,
					type: row.plan_type,
					clients: row.client_id ? {
						id: row.client_id,
						name: row.client_name,
						email: row.client_email,
					} : null,
					products: row.product_id ? {
						id: row.product_id,
						name: row.product_name,
					} : null,
				} : null,
			}] : [],
		})) || [];

		return { data: transformedData, count: count || 0 };
	} catch (error) {
		console.error("Unexpected error in getPaymentsWithFilters:", error);
		return { data: [], count: 0 };
	}
}