"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { paymentUpdateSchema } from "@/features/finance/types/payment";

import { returnValidationErrors } from "next-safe-action";

export const updatePaymentAction = actionClient
	.inputSchema(paymentUpdateSchema)
	.action(async ({ parsedInput }) => {
		const { id, ...updateData } = parsedInput;

		try {
			const supabase = await createClient();

			// 1. Check if payment exists
			const { data: existingPayment, error: fetchError } = await supabase
				.from("payments")
				.select("id")
				.eq("id", id)
				.single();

			if (fetchError || !existingPayment) {
				return returnValidationErrors(paymentUpdateSchema, {
					_errors: ["Payment not found"],
				});
			}

			// 2. Prepare update data (remove undefined values)
			const cleanUpdateData: any = {};

			if (updateData.amount !== undefined)
				cleanUpdateData.amount = updateData.amount;
			if (updateData.payment_date !== undefined)
				cleanUpdateData.payment_date = updateData.payment_date;
			if (updateData.payment_method !== undefined)
				cleanUpdateData.payment_method = updateData.payment_method;
			if (updateData.stripe_transaction_id !== undefined)
				cleanUpdateData.stripe_transaction_id =
					updateData.stripe_transaction_id;
			if (updateData.status !== undefined)
				cleanUpdateData.status = updateData.status;
			if (updateData.platform !== undefined)
				cleanUpdateData.platform = updateData.platform;
			if (updateData.declined_at !== undefined)
				cleanUpdateData.declined_at = updateData.declined_at;
			if (updateData.disputed_status !== undefined)
				cleanUpdateData.disputed_status = updateData.disputed_status;
			if (updateData.dispute_fee !== undefined)
				cleanUpdateData.dispute_fee = updateData.dispute_fee;

			// 3. Update the payment record
			const { data: updatedPayment, error: updateError } = await supabase
				.from("payments")
				.update({
					...cleanUpdateData,
					updated_at: new Date().toISOString(),
				})
				.eq("id", id)
				.select()
				.single();

			if (updateError) {
				console.error("Error updating payment:", updateError);
				return returnValidationErrors(paymentUpdateSchema, {
					_errors: ["Failed to update payment. Please try again."],
				});
			}

			if (!updatedPayment) {
				return returnValidationErrors(paymentUpdateSchema, {
					_errors: ["Payment update failed. Please try again."],
				});
			}

			// 4. Revalidate relevant paths
			revalidatePath("/dashboard/finance/payments");
			revalidatePath(`/dashboard/finance/payments/${id}`);
			revalidatePath("/dashboard");

			return {
				success: true,
				data: {
					success: "Payment updated successfully",
					payment: updatedPayment,
				},
			};
		} catch (error) {
			console.error("Unexpected error in updatePayment:", error);

			return returnValidationErrors(paymentUpdateSchema, {
				_errors: ["Failed to update payment. Please try again."],
			});
		}
	});
