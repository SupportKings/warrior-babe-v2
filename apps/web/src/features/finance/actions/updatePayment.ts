"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

import { returnValidationErrors } from "next-safe-action";
import { paymentUpdateSchema } from "../types/payment";

export const updatePayment = actionClient
	.inputSchema(paymentUpdateSchema)
	.action(async ({ parsedInput }) => {
		// Authentication check
		const session = await getUser();
		if (!session) {
			returnValidationErrors(paymentUpdateSchema, {
				_errors: ["Unauthorized: Please log in to update a payment"],
			});
		}

		const supabase = await createClient();

		const { id, ...updateData } = parsedInput;

		// Update payment in database
		const { data: payment, error } = await supabase
			.from("payments")
			.update(updateData as any)
			.eq("id", id)
			.select()
			.single();

		if (error) {
			console.error("Error updating payment:", error);

			returnValidationErrors(paymentUpdateSchema, {
				_errors: [error.message || "Failed to update payment"],
			});
		}

		// Revalidate relevant paths
		revalidatePath("/dashboard/finance/payments");
		revalidatePath(`/dashboard/finance/payments/${id}`);
		revalidatePath("/dashboard/finance");

		return {
			success: true,
			data: payment,
			message: "Payment updated successfully",
		};
	});
