"use server";

import { createClient } from "@/utils/supabase/server";

export async function createPayment(data: any) {
	// Placeholder for create payment functionality
	try {
		const supabase = await createClient();

		const { data: payment, error } = await supabase
			.from("payments")
			.insert(data)
			.select()
			.single();

		if (error) {
			console.error("Error creating payment:", error);
			throw new Error(error.message);
		}

		return payment;
	} catch (error) {
		console.error("Unexpected error in createPayment:", error);
		throw error;
	}
}
