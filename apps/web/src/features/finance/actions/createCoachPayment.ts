"use server";

import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

const createCoachPaymentSchema = z.object({
	coach_id: z.string().uuid("Invalid coach ID"),
	amount: z.number().positive("Amount must be positive"),
	status: z.enum(["Paid", "Not Paid"]),
	date: z.string(),
});

export const createCoachPaymentAction = actionClient
	.inputSchema(createCoachPaymentSchema)
	.action(async ({ parsedInput }) => {
		try {
			const supabase = await createClient();

			const { data, error } = await supabase
				.from("coach_payments")
				.insert(parsedInput)
				.select()
				.single();

			if (error) {
				console.error("Error creating coach payment:", error);
				return {
					success: false,
					error: "Failed to create coach payment",
				};
			}

			return {
				success: true,
				data,
			};
		} catch (error) {
			console.error("Unexpected error in createCoachPayment:", error);
			return {
				success: false,
				error: "An unexpected error occurred",
			};
		}
	});