"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

import { returnValidationErrors } from "next-safe-action";
import { paymentCreateSchema } from "../types/payment";

export const createPayment = actionClient
	.inputSchema(paymentCreateSchema)
	.action(async ({ parsedInput }) => {
		// Authentication check
		const session = await getUser();
		if (!session) {
			returnValidationErrors(paymentCreateSchema, {
				_errors: ["Unauthorized: Please log in to create a payment"],
			});
		}

		const supabase = await createClient();

		// Prepare the payment data
		const paymentData = {
			amount: Math.round(parsedInput.amount * 100), // Convert to cents
			payment_date: parsedInput.payment_date,
			payment_method: parsedInput.payment_method,
			platform: parsedInput.platform,
			status: parsedInput.status,
			client_email: parsedInput.client_email,
		};

		// Insert payment into database
		const { data: payment, error } = await supabase
			.from("payments")
			.insert(paymentData)
			.select()
			.single();

		if (error) {
			console.error("Error creating payment:", error);

			// Handle specific database errors
			if (error.code === "23505") {
				// Unique violation
				returnValidationErrors(paymentCreateSchema, {
					_errors: ["A payment with these details already exists"],
				});
			}

			returnValidationErrors(paymentCreateSchema, {
				_errors: [error.message || "Failed to create payment"],
			});
		}

		// Revalidate relevant paths
		revalidatePath("/dashboard/finance/payments");
		revalidatePath("/dashboard/finance");

		return {
			success: true,
			data: payment,
			message: "Payment created successfully",
		};
	});
