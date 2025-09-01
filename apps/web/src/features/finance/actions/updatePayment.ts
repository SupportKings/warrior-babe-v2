"use server";

import { createClient } from "@/utils/supabase/server";

export async function updatePayment({ id, ...data }: { id: string } & any) {
	// Placeholder for update payment functionality
	try {
		const supabase = await createClient();

		const { data: payment, error } = await supabase
			.from("payments")
			.update(data)
			.eq("id", id)
			.select()
			.single();

		if (error) {
			console.error("Error updating payment:", error);
			throw new Error(error.message);
		}

		return payment;
	} catch (error) {
		console.error("Unexpected error in updatePayment:", error);
		throw error;
	}
}
