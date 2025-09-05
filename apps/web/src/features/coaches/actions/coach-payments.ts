"use server";

import { revalidatePath } from "next/cache";

import { equal } from "assert";

import { createClient } from "@/utils/supabase/server";

import { format } from "date-fns";
import { z } from "zod";

// Validation schemas
const createCoachPaymentSchema = z.object({
	coach_id: z.uuid("Invalid coach ID"),
	client_activity_period_id: z.uuid("Invalid activity period ID"),
	amount: z.number().positive("Amount must be positive"),
	status: z.enum(["Paid", "Not Paid"], {
		message: "Status must be either 'Paid' or 'Not Paid'",
	}),
	date: z.string().min(1, "Date is required"),
});

const updateCoachPaymentSchema = z.object({
	id: z.uuid("Invalid payment ID"),
	client_activity_period_id: z.uuid("Invalid activity period ID").optional(),
	amount: z.number().positive("Amount must be positive").optional(),
	status: z
		.enum(["Paid", "Not Paid"], {
			message: "Status must be either 'Paid' or 'Not Paid'",
		})
		.optional(),
	date: z.string().min(1, "Date is required").optional(),
});

export type CreateCoachPaymentInput = z.infer<typeof createCoachPaymentSchema>;
export type UpdateCoachPaymentInput = z.infer<typeof updateCoachPaymentSchema>;

// Create a new coach payment
export async function createCoachPayment(input: CreateCoachPaymentInput) {
	try {
		const validatedInput = createCoachPaymentSchema.parse(input);
		const supabase = await createClient();

		const { data: payment, error } = await supabase
			.from("coach_payments")
			.insert({
				coach_id: validatedInput.coach_id,
				amount: validatedInput.amount,
				status: validatedInput.status,
				date: validatedInput.date,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})
			.select()
			.single();

		if (error) {
			console.error("Error creating coach payment:", error);
			return {
				success: false,
				message: `Failed to create payment: ${error.message}`,
			};
		}

		const { data: activityPeriodData, error: activityPeriodError } =
			await supabase
				.from("client_activity_period")
				.update({ coach_payment: payment.id })
				.eq("id", validatedInput.client_activity_period_id)
				.select()
				.single();

		if (activityPeriodError) {
			console.error(
				"Error linking payment to activity period:",
				activityPeriodError,
			);
			// Note: Payment was created successfully, but linking failed
		}

		// Revalidate the coach details page
		revalidatePath(`/dashboard/coaches/${validatedInput.coach_id}`);

		return {
			success: true,
			data: payment,
			message: "Payment created successfully",
		};
	} catch (error) {
		console.error("Unexpected error in createCoachPayment:", error);
		if (error instanceof z.ZodError) {
			return {
				success: false,
				message: error.message,
			};
		}
		return {
			success: false,
			message:
				error instanceof Error ? error.message : "An unexpected error occurred",
		};
	}
}

// Update an existing coach payment
export async function updateCoachPayment(input: UpdateCoachPaymentInput) {
	try {
		const validatedInput = updateCoachPaymentSchema.parse(input);
		const supabase = await createClient();

		const updateData: any = {
			updated_at: new Date().toISOString(),
		};

		if (validatedInput.client_activity_period_id !== undefined) {
			updateData.client_activity_period_id =
				validatedInput.client_activity_period_id;
		}
		if (validatedInput.amount !== undefined) {
			updateData.amount = validatedInput.amount;
		}
		if (validatedInput.status !== undefined) {
			updateData.status = validatedInput.status;
		}
		if (validatedInput.date !== undefined) {
			updateData.date = validatedInput.date;
		}

		const { data: payment, error } = await supabase
			.from("coach_payments")
			.update(updateData)
			.eq("id", validatedInput.id)
			.select()
			.single();

		if (error) {
			console.error("Error updating coach payment:", error);
			return {
				success: false,
				message: `Failed to update payment: ${error.message}`,
			};
		}

		// Link payment to activity period if client_activity_period_id was updated
		if (validatedInput.client_activity_period_id !== undefined && payment) {
			const { error: activityPeriodError } = await supabase
				.from("client_activity_period")
				.update({ coach_payment: payment.id })
				.eq("id", validatedInput.client_activity_period_id);

			if (activityPeriodError) {
				console.error(
					"Error linking payment to activity period:",
					activityPeriodError,
				);
				// Note: Payment was updated successfully, but linking failed
			}
		}

		if (payment?.coach_id) {
			revalidatePath(`/dashboard/coaches/${payment.coach_id}`);
		}
		return {
			success: true,
			data: payment,
			message: "Payment updated successfully",
		};
	} catch (error) {
		console.error("Unexpected error in updateCoachPayment:", error);
		if (error instanceof z.ZodError) {
			return {
				success: false,
				message: error.message,
			};
		}
		return {
			success: false,
			message:
				error instanceof Error ? error.message : "An unexpected error occurred",
		};
	}
}

// Delete a coach payment
export async function deleteCoachPayment(paymentId: string, coachId: string) {
	try {
		const supabase = await createClient();

		const { error } = await supabase
			.from("coach_payments")
			.delete()
			.eq("id", paymentId);

		if (error) {
			console.error("Error deleting coach payment:", error);
			return {
				success: false,
				message: `Failed to delete payment: ${error.message}`,
			};
		}

		// Revalidate the coach details page
		revalidatePath(`/dashboard/coaches/${coachId}`);

		return {
			success: true,
			message: "Payment deleted successfully",
		};
	} catch (error) {
		console.error("Unexpected error in deleteCoachPayment:", error);
		return {
			success: false,
			message:
				error instanceof Error ? error.message : "An unexpected error occurred",
		};
	}
}

// Get a single coach payment for editing
export async function getCoachPayment(paymentId: string) {
	try {
		const supabase = await createClient();

		const { data: payment, error } = await supabase
			.from("coach_payments")
			.select(
				`
        *,
        client_activity_period:client_activity_period!coach_payments_client_activity_period_id_client_activity_period (
          id,
          start_date,
          end_date,
          active,
          client:clients!client_activity_period_client_id_clients_id_fk (
            id,
            name
          )
        )
      `,
			)
			.eq("id", paymentId)
			.single();

		if (error) {
			console.error("Error fetching coach payment:", error);
			return null;
		}

		return payment;
	} catch (error) {
		console.error("Unexpected error in getCoachPayment:", error);
		return null;
	}
}

// Get client activity periods for a coach (for selection in create/edit forms)
export async function getCoachClientActivityPeriods(coachId: string) {
	console.log("coach id", coachId);
	try {
		const supabase = await createClient();

		// Directly fetch activity periods that belong to this coach
		// The coach_id field exists on client_activity_period table
		const { data: activityPeriods, error } = await supabase
			.from("client_activity_period")
			.select("*")
			.eq("coach_id", coachId)
			.order("start_date", { ascending: false });

		console.log("Activity periods query error:", error);

		const finalActivityPeriods = activityPeriods || [];

		console.log(activityPeriods);

		const formattedPeriods =
			finalActivityPeriods
				?.filter(
					(period): period is any =>
						period && typeof period === "object" && "id" in period,
				)
				.map((period) => ({
					id: period.id,
					label: `${
						period.start_date
							? format(new Date(period.start_date), "MMM dd, yyyy")
							: "N/A"
					} to ${
						period.end_date
							? format(new Date(period.end_date), "MMM dd, yyyy")
							: "Present"
					}${period.active ? " (Active)" : ""}`,
					startDate: period.start_date,
					endDate: period.end_date,
					active: period.active,
				})) || [];
		console.log(formattedPeriods);
		return formattedPeriods;
	} catch (error) {
		console.error("Unexpected error in getCoachClientActivityPeriods:", error);
		return [];
	}
}
