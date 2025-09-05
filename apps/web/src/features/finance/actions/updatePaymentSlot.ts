"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { generateActivityPeriods } from "@/features/client_activity_period/services/generateActivityPeriods";

import { getUser } from "@/queries/getUser";

import { z } from "zod";

const updatePaymentSlotSchema = z.object({
	paymentId: z.string(),
	paymentSlotId: z.string().nullable(),
});

export const updatePaymentSlot = actionClient
	.inputSchema(updatePaymentSlotSchema)
	.action(async ({ parsedInput }) => {
		const { paymentId, paymentSlotId } = parsedInput;
		const supabase = await createClient();
		const user = await getUser();

		if (!user) {
			throw new Error("Authentication required");
		}

		// If we're assigning a new payment slot
		if (paymentSlotId) {
			// First, check if the payment slot is available (not already assigned)
			const { data: existingSlot, error: checkError } = await supabase
				.from("payment_slots")
				.select("id, payment_id")
				.eq("id", paymentSlotId)
				.single();

			if (checkError) {
				throw new Error(`Failed to check payment slot: ${checkError.message}`);
			}

			if (existingSlot.payment_id && existingSlot.payment_id !== paymentId) {
				throw new Error(
					"This payment slot is already assigned to another payment",
				);
			}

			// Update the payment slot to assign it to this payment
			const { error: updateSlotError } = await supabase
				.from("payment_slots")
				.update({
					payment_id: paymentId,
					updated_at: new Date().toISOString(),
				})
				.eq("id", paymentSlotId);

			if (updateSlotError) {
				throw new Error(
					`Failed to assign payment slot: ${updateSlotError.message}`,
				);
			}

			// If this payment was previously assigned to a different slot, clear that assignment
			const { error: clearOldError } = await supabase
				.from("payment_slots")
				.update({
					payment_id: null,
					updated_at: new Date().toISOString(),
				})
				.eq("payment_id", paymentId)
				.neq("id", paymentSlotId);

			if (clearOldError) {
				throw new Error(
					`Failed to clear previous assignment: ${clearOldError.message}`,
				);
			}

			// Generate activity periods for the assigned payment slot
			try {
				const activityResult = await generateActivityPeriods(paymentSlotId);
				console.log("Activity periods generated:", activityResult);

				// Revalidate relevant paths after successful generation
				revalidatePath("/dashboard/clients/activity-periods");
				revalidatePath("/dashboard/finance");

				return {
					success: true,
					message: "Payment slot assigned successfully",
					activityMessage: `Generated ${activityResult.data.periodsCreated} activity periods for ${activityResult.data.clientName}`,
					periodsCreated: activityResult.data.periodsCreated,
				};
			} catch (activityError) {
				console.error("Failed to generate activity periods:", activityError);

				// Revalidate even if activity generation fails
				revalidatePath("/dashboard/finance");

				return {
					success: true,
					message: "Payment slot assigned successfully",
					warning:
						"Failed to generate activity periods - please create them manually",
					error:
						activityError instanceof Error
							? activityError.message
							: "Unknown error",
				};
			}
		} else {
			// If paymentSlotId is null, we're removing the assignment
			// First, find which slot was previously assigned to this payment
			const { data: previousSlot } = await supabase
				.from("payment_slots")
				.select("id")
				.eq("payment_id", paymentId)
				.single();

			const { error: clearError } = await supabase
				.from("payment_slots")
				.update({
					payment_id: null,
					updated_at: new Date().toISOString(),
				})
				.eq("payment_id", paymentId);

			if (clearError) {
				throw new Error(
					`Failed to clear payment slot assignment: ${clearError.message}`,
				);
			}

			// Delete activity periods that were created by this slot
			let periodsDeleted = 0;
			if (previousSlot?.id) {
				// First, count how many periods will be deleted
				const { count } = await supabase
					.from("client_activity_period")
					.select("*", { count: "exact", head: true })
					.eq("payment_slot", previousSlot.id);

				periodsDeleted = count || 0;

				const { error: deletePeriodsError } = await supabase
					.from("client_activity_period")
					.delete()
					.eq("payment_slot", previousSlot.id);

				if (deletePeriodsError) {
					console.error(
						"Failed to delete activity periods:",
						deletePeriodsError,
					);

					// Revalidate even if deletion fails
					revalidatePath("/dashboard/clients/activity-periods");
					revalidatePath("/dashboard/finance");

					return {
						success: true,
						message: "Payment slot removed successfully",
						warning:
							"Failed to delete some activity periods - please check manually",
						error: deletePeriodsError.message,
					};
				}
			}

			// Revalidate relevant paths after successful removal
			revalidatePath("/dashboard/clients/activity-periods");
			revalidatePath("/dashboard/finance");

			return {
				success: true,
				message: "Payment slot removed successfully",
				activityMessage:
					periodsDeleted > 0
						? `Removed ${periodsDeleted} activity periods`
						: "No activity periods to remove",
				periodsDeleted,
			};
		}
	});
