"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

import { returnValidationErrors } from "next-safe-action";
import { clientActivityPeriodCreateSchema } from "../types/clientActivityPeriod";

export const createClientActivityPeriodAction = actionClient
	.inputSchema(clientActivityPeriodCreateSchema)
	.action(async ({ parsedInput }) => {
		// Check authentication
		const user = await getUser();
		if (!user) {
			return returnValidationErrors(clientActivityPeriodCreateSchema, {
				_errors: ["Authentication required. Please sign in."],
			});
		}

		const supabase = await createClient();

		// Insert the new client activity period
		const { data: newPeriod, error } = await supabase
			.from("client_activity_period")
			.insert({
				payment_plan: parsedInput.payment_plan,
				payment_slot: parsedInput.payment_slot_id,
				coach_id: parsedInput.coach_id,
				start_date: parsedInput.start_date,
				end_date: parsedInput.end_date,
				active: parsedInput.active,
			})
			.select()
			.single();

		if (error) {
			console.error("Failed to create client activity period:", error);
			console.error("Parsed input:", parsedInput);
			return returnValidationErrors(clientActivityPeriodCreateSchema, {
				_errors: [`Failed to create client activity period: ${error.message}`],
			});
		}

		// Revalidate relevant paths
		revalidatePath("/dashboard/clients/activity-periods");

		return {
			success: true,
			data: newPeriod,
		};
	});
