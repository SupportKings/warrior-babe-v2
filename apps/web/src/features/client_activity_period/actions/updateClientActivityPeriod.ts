"use server";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { clientActivityPeriodEditFormSchema } from "../types/clientActivityPeriod";

export const updateClientActivityPeriodAction = actionClient
	.inputSchema(clientActivityPeriodEditFormSchema)
	.action(async ({ parsedInput }) => {
		const supabase = await createClient();

		const { id, ...updateData } = parsedInput;

		// First check if the client activity period exists
		const { data: existingPeriod, error: checkError } = await supabase
			.from("client_activity_period")
			.select("id")
			.eq("id", id)
			.single();

		if (checkError || !existingPeriod) {
			throw new Error("Client activity period not found");
		}

		// Update the client activity period
		const { data: updatedPeriod, error } = await supabase
			.from("client_activity_period")
			.update({
				client_id: updateData.client_id,
				coach_id: updateData.coach_id,
				start_date: updateData.start_date,
				end_date: updateData.end_date,
				active: updateData.active,
			})
			.eq("id", id)
			.select()
			.single();

		if (error) {
			throw new Error(
				`Failed to update client activity period: ${error.message}`,
			);
		}

		return updatedPeriod;
	});
