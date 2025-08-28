"use server";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

const deleteSchema = z.object({
	id: z.string().min(1, "ID is required"),
});

export const deleteClientActivityPeriod = actionClient
	.inputSchema(deleteSchema)
	.action(async ({ parsedInput: { id } }) => {
		const supabase = await createClient();

		// First check if the client activity period exists
		const { data: existingPeriod, error: checkError } = await supabase
			.from("client_activity_period")
			.select("id")
			.eq("id", id)
			.single();

		if (checkError || !existingPeriod) {
			throw new Error("Client activity period not found");
		}

		// Delete the client activity period
		const { error } = await supabase
			.from("client_activity_period")
			.delete()
			.eq("id", id);

		if (error) {
			throw new Error(
				`Failed to delete client activity period: ${error.message}`,
			);
		}

		return { success: true, id };
	});
