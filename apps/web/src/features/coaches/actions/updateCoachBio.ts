"use server";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

const schema = z.object({
	userId: z.string(),
	bio: z.string().nullable(),
});

export const updateCoachBio = actionClient
	.inputSchema(schema)
	.action(async ({ parsedInput }) => {
		const supabase = await createClient();

		const { error } = await supabase
			.from("user")
			.update({ bio: parsedInput.bio })
			.eq("id", parsedInput.userId);

		if (error) {
			throw new Error("Failed to update bio");
		}

		return { success: true };
	});
