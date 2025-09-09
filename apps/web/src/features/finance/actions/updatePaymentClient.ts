"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

import { z } from "zod";

const updatePaymentClientSchema = z.object({
	paymentId: z.string(),
	clientEmailId: z.number().nullable(),
});

export const updatePaymentClient = actionClient
	.inputSchema(updatePaymentClientSchema)
	.action(async ({ parsedInput }) => {
		const { paymentId, clientEmailId } = parsedInput;
		const supabase = await createClient();
		const user = await getUser();

		if (!user) {
			throw new Error("Authentication required");
		}

		// Update the payment's client_email field
		const { error: updatePaymentError } = await supabase
			.from("payments")
			.update({
				client_email: clientEmailId,
				updated_at: new Date().toISOString(),
			})
			.eq("id", paymentId);

		if (updatePaymentError) {
			throw new Error(
				`Failed to update payment client: ${updatePaymentError.message}`,
			);
		}

		// Revalidate relevant paths
		revalidatePath("/dashboard/finance");
		revalidatePath("/dashboard/finance/payments");

		return {
			success: true,
			message: "Payment client updated successfully",
		};
	});