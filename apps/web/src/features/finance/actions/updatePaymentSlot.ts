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
			// Update the payment to assign it to this payment slot
			const { error: updatePaymentError } = await supabase
				.from("payments")
				.update({
					payment_slot_id: paymentSlotId,
					updated_at: new Date().toISOString(),
				})
				.eq("id", paymentId);

			if (updatePaymentError) {
				throw new Error(
					`Failed to assign payment slot: ${updatePaymentError.message}`,
				);
			}

			// Generate activity periods for the assigned payment slot
			try {
				const activityResult = await generateActivityPeriods(paymentSlotId);
				console.log("Activity periods generated:", activityResult);

				// Revalidate relevant paths after successful generation
				revalidatePath("/dashboard/clients/activity-periods");
				revalidatePath("/dashboard/finance");

				const periodsCreated = activityResult.data.periodsCreated || 0;
				let activityMessage = "";
				
				if (periodsCreated > 0) {
					activityMessage = `Generated ${periodsCreated} activity periods for ${activityResult.data.clientName}`;
				} else if (activityResult.data.message) {
					activityMessage = activityResult.data.message;
				} else {
					activityMessage = "Activity periods already exist for this slot";
				}

				return {
					success: true,
					message: "Payment slot assigned successfully",
					activityMessage,
					periodsCreated,
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
			// First, get the current payment to find which slot was assigned
			const { data: currentPayment } = await supabase
				.from("payments")
				.select("payment_slot_id")
				.eq("id", paymentId)
				.single();

			const previousSlotId = currentPayment?.payment_slot_id;

			// Clear the payment slot assignment from the payment
			const { error: clearError } = await supabase
				.from("payments")
				.update({
					payment_slot_id: null,
					updated_at: new Date().toISOString(),
				})
				.eq("id", paymentId);

			if (clearError) {
				throw new Error(
					`Failed to clear payment slot assignment: ${clearError.message}`,
				);
			}

			// Delete activity periods that were created by this slot
			let periodsDeleted = 0;
			if (previousSlotId) {
				// First, count how many periods will be deleted
				const { count } = await supabase
					.from("client_activity_period")
					.select("*", { count: "exact", head: true })
					.eq("payment_slot", previousSlotId);

				periodsDeleted = count || 0;

				const { error: deletePeriodsError } = await supabase
					.from("client_activity_period")
					.delete()
					.eq("payment_slot", previousSlotId);

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
