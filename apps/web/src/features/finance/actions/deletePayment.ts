"use server";

import { createClient } from "@/utils/supabase/server";

export async function deletePayment({ id }: { id: string }) {
	try {
		const supabase = await createClient();

		const { error } = await supabase.from("payments").delete().eq("id", id);

		if (error) {
			console.error("Error deleting payment:", error);
			throw new Error(error.message);
		}

		return { success: true };
	} catch (error) {
		console.error("Unexpected error in deletePayment:", error);
		throw error;
	}
}
