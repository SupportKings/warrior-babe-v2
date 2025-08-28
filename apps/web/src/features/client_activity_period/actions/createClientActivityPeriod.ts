"use server";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { clientActivityPeriodFormSchema } from "../types/clientActivityPeriod";

export const createClientActivityPeriodAction = actionClient
	.inputSchema(clientActivityPeriodFormSchema)
	.action(async ({ parsedInput }) => {
		const supabase = await createClient();

		// Insert the new client activity period
		const { data: newPeriod, error } = await supabase
			.from("client_activity_period")
			.insert({
				client_id: parsedInput.client_id,
				coach_id: parsedInput.coach_id,
				start_date: parsedInput.start_date,
				end_date: parsedInput.end_date,
				active: parsedInput.active,
			})
			.select()
			.single();

		if (error) {
			throw new Error(
				`Failed to create client activity period: ${error.message}`,
			);
		}

		return newPeriod;
	});
