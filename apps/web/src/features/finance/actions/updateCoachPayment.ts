"use server";

import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

const updateCoachPaymentSchema = z.object({
	id: z.string().uuid("Invalid coach payment ID"),
	coach_id: z.string().uuid("Invalid coach ID").optional(),
	amount: z.number().positive("Amount must be positive").optional(),
	status: z.enum(["Paid", "Not Paid"]).optional(),
	date: z.string().optional(),
});

export const updateCoachPaymentAction = actionClient
	.inputSchema(updateCoachPaymentSchema)
	.action(async ({ parsedInput }) => {
		try {
			const supabase = await createClient();

			const { id, ...updateData } = parsedInput;

			const { data, error } = await supabase
				.from("coach_payments")
				.update(updateData)
				.eq("id", id)
				.select()
				.single();

			if (error) {
				console.error("Error updating coach payment:", error);
				return {
					success: false,
					error: "Failed to update coach payment",
				};
			}

			return {
				success: true,
				data,
			};
		} catch (error) {
			console.error("Unexpected error in updateCoachPayment:", error);
			return {
				success: false,
				error: "An unexpected error occurred",
			};
		}
	});