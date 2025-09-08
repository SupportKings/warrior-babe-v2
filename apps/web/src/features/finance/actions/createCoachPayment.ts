"use server";

import { revalidatePath } from "next/cache";
import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";
import { coachPaymentCreateSchema } from "@/features/finance/types/coach-payment";
import { returnValidationErrors } from "next-safe-action";
import { getUser } from "@/queries/getUser";

export const createCoachPaymentAction = actionClient
	.inputSchema(coachPaymentCreateSchema)
	.action(async ({ parsedInput }) => {
		try {
			const supabase = await createClient();
			const user = await getUser();

			if (!user) {
				return returnValidationErrors(coachPaymentCreateSchema, {
					_errors: ["Authentication required"],
				});
			}

			// Extract activity periods from input
			const { activity_period_ids, ...paymentData } = parsedInput;

			// Check if coach exists
			const { data: coach, error: coachError } = await supabase
				.from("team_members")
				.select("id, name")
				.eq("id", paymentData.coach_id)
				.single();

			if (coachError || !coach) {
				return returnValidationErrors(coachPaymentCreateSchema, {
					coach_id: {
						_errors: ["Coach not found"],
					},
				});
			}

			// Create the coach payment
			const { data: newPayment, error: paymentError } = await supabase
				.from("coach_payments")
				.insert({
					coach_id: paymentData.coach_id,
					amount: paymentData.amount,
					status: paymentData.status,
					date: paymentData.date,
				})
				.select()
				.single();

			if (paymentError) {
				console.error("Error creating coach payment:", paymentError);
				return returnValidationErrors(coachPaymentCreateSchema, {
					_errors: ["Failed to create coach payment. Please try again."],
				});
			}

			// Attach activity periods if provided
			if (activity_period_ids && activity_period_ids.length > 0) {
				const { error: periodError } = await supabase
					.from("client_activity_period")
					.update({ coach_payment: newPayment.id })
					.in("id", activity_period_ids)
					.eq("coach_id", paymentData.coach_id)
					.is("coach_payment", null);

				if (periodError) {
					console.error("Error attaching activity periods:", periodError);
					// Don't fail the whole operation, just log the error
				}
			}

			// Revalidate relevant paths
			revalidatePath("/dashboard/finance/coach-payments");
			revalidatePath(`/dashboard/finance/coach-payments/${newPayment.id}`);
			revalidatePath("/dashboard");

			return {
				success: true,
				data: {
					success: "Coach payment created successfully",
					coachPayment: {
						id: newPayment.id,
						coach_id: newPayment.coach_id,
						amount: newPayment.amount,
						status: newPayment.status,
						date: newPayment.date,
					},
				},
			};
		} catch (error) {
			console.error("Unexpected error in createCoachPayment:", error);
			return returnValidationErrors(coachPaymentCreateSchema, {
				_errors: ["An unexpected error occurred. Please try again."],
			});
		}
	});
