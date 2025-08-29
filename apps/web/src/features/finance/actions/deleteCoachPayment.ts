"use server";

import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

const deleteCoachPaymentSchema = z.object({
	id: z.string().uuid("Invalid coach payment ID"),
});

export const deleteCoachPayment = actionClient
	.inputSchema(deleteCoachPaymentSchema)
	.action(async ({ parsedInput }) => {
		try {
			const supabase = await createClient();

			const { error } = await supabase
				.from("coach_payments")
				.delete()
				.eq("id", parsedInput.id);

			if (error) {
				console.error("Error deleting coach payment:", error);
				return {
					success: false,
					error: "Failed to delete coach payment",
				};
			}

			return {
				success: true,
			};
		} catch (error) {
			console.error("Unexpected error in deleteCoachPayment:", error);
			return {
				success: false,
				error: "An unexpected error occurred",
			};
		}
	});