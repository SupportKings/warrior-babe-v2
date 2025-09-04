"use server";

import { createClient } from "@/utils/supabase/server";

export async function getStripePaymentDetails(chargeId: string) {
	if (!chargeId) {
		throw new Error("Charge ID is required");
	}

	try {
		const supabase = await createClient();

		const { data, error } = await supabase
			.schema("stripe")
			.from("charges")
			.select("*")
			.eq("id", chargeId)
			.single();

		if (error) {
			throw new Error(`Failed to fetch payment details: ${error.message}`);
		}

		if (!data) {
			throw new Error("Payment not found");
		}

		return data;
	} catch (error) {
		console.error("Error fetching Stripe payment details:", error);
		throw error;
	}
}
