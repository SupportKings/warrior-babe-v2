"use server";

import { createClient } from "@/utils/supabase/server";

export async function getAllPaymentPlansWithClients() {
	try {
		const supabase = await createClient();

		const { data: paymentPlans, error } = await supabase
			.from("payment_plans")
			.select(`
				*,
				client:clients!payment_plans_client_id_fkey (
					id,
					name,
					email
				),
				product:products (
					id,
					name,
					description
				),
				payment_plan_template:payment_plan_templates!payment_plans_type_fkey (
					id,
					name
				)
			`)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching payment plans:", error);
			return [];
		}

		return paymentPlans || [];
	} catch (error) {
		console.error("Unexpected error fetching payment plans:", error);
		return [];
	}
}
