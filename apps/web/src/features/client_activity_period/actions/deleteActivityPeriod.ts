"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

const deleteActivityPeriodSchema = z.object({
	id: z.string().uuid(),
});

export const deleteActivityPeriod = actionClient
	.inputSchema(deleteActivityPeriodSchema)
	.action(async ({ parsedInput }) => {
		const { id } = parsedInput;

		const supabase = await createClient();

		// Delete the activity period
		const { error } = await supabase
			.from("client_activity_period")
			.delete()
			.eq("id", id);

		if (error) {
			throw new Error(`Failed to delete activity period: ${error.message}`);
		}

		// Revalidate paths
		revalidatePath("/dashboard/clients");
		revalidatePath("/dashboard");

		return { success: true };
	});
