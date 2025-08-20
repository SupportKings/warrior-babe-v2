"use server";


import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

const schema = z.object({
	coachId: z.string().min(1),
	maxClientUnits: z.number().min(1).max(1000).nullable(),
});

export const updateCoachCapacity = actionClient
	.inputSchema(schema)
	.action(async ({ parsedInput }) => {
		const supabase = await createClient();

		const { coachId, maxClientUnits } = parsedInput;

		try {
			if (maxClientUnits === null) {
				// Delete the capacity record to use global default
				const { error } = await supabase
					.from("coach_capacity")
					.delete()
					.eq("coach_id", coachId);

				if (error) throw error;
			} else {
				// Check if coach_capacity record exists
				const { data: existingCapacity } = await supabase
					.from("coach_capacity")
					.select("id")
					.eq("coach_id", coachId)
					.single();

				if (existingCapacity) {
					// Update existing record
					const { error } = await supabase
						.from("coach_capacity")
						.update({
							max_client_units: maxClientUnits,
							updated_at: new Date().toISOString(),
						})
						.eq("coach_id", coachId);

					if (error) throw error;
				} else {
					// Create new record if it doesn't exist
					const { error } = await supabase.from("coach_capacity").insert({
						coach_id: coachId,
						max_client_units: maxClientUnits,
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString(),
					});

					if (error) throw error;
				}
			}




			return { success: true };
		} catch (error) {
			console.error("Failed to update coach capacity:", error);
			throw new Error("Failed to update coach capacity");
		}
	});
