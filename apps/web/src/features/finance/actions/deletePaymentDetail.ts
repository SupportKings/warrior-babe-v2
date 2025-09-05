"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

const deletePaymentSchema = z.object({
	id: z.string().uuid("Invalid payment ID"),
});

export const deletePaymentAction = actionClient
	.inputSchema(deletePaymentSchema)
	.action(async ({ parsedInput }) => {
		const { id } = parsedInput;

		try {
			const supabase = await createClient();

			// First, check if payment exists
			const { data: existingPayment, error: checkError } = await supabase
				.from("payments")
				.select("id")
				.eq("id", id)
				.single();

			if (checkError || !existingPayment) {
				throw new Error("Payment not found");
			}

			// Delete the payment
			const { error: deleteError } = await supabase
				.from("payments")
				.delete()
				.eq("id", id);

			if (deleteError) {
				console.error("Error deleting payment:", deleteError);
				throw new Error("Failed to delete payment");
			}

			// Revalidate relevant paths
			revalidatePath("/dashboard/finance/payments");
			revalidatePath("/dashboard");

			return {
				success: true,
				data: {
					message: "Payment deleted successfully",
				},
			};
		} catch (error) {
			console.error("Error in deletePaymentAction:", error);
			throw error;
		}
	});
