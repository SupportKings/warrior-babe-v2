"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "@/queries/getUser";

// Server action to fetch available payment slots for a specific client
export async function getPaymentSlotsForClient(clientId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	// Fetch payment slots for a specific client with plan and product details
	// Only show slots that don't already have a payment assigned
	const { data, error } = await supabase
		.from("payment_slots")
		.select(`
			id,
			due_date,
			amount_due,
			notes,
			payment_plans!inner(
				id,
				name,
				client_id,
				product_id,
				clients!inner(
					id,
					name
				),
				products!inner(
					id,
					name
				)
			)
		`)
		.eq("payment_plans.client_id", clientId)
		.is("payment_id", null) // Only unassigned slots
		.order("due_date", { ascending: true });

	if (error) {
		throw new Error(`Failed to fetch payment slots: ${error.message}`);
	}

	return data || [];
}

// Server action to fetch all available payment slots (for general use)
export async function getAllAvailablePaymentSlots() {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	// Fetch all payment slots with client, plan and product details
	// Only show slots that don't already have a payment assigned
	const { data, error } = await supabase
		.from("payment_slots")
		.select(`
			id,
			due_date,
			amount_due,
			notes,
			payment_plans!inner(
				id,
				name,
				product_id,
				clients!inner(
					id,
					name
				),
				products!inner(
					id,
					name
				)
			)
		`)
		.is("payment_id", null) // Only unassigned slots
		.order("due_date", { ascending: true });

	if (error) {
		throw new Error(`Failed to fetch payment slots: ${error.message}`);
	}

	return data || [];
}