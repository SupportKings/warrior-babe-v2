"use server";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

const schema = z.object({
	userId: z.string().min(1),
	calendarLink: z.string().url().nullable(),
});

export const updateCalendarLink = actionClient
	.inputSchema(schema)
	.action(async ({ parsedInput }) => {
		const supabase = await createClient();

		const { error } = await supabase
			.from("user")
			.update({
				calendar_link: parsedInput.calendarLink,
			})
			.eq("id", parsedInput.userId);

		if (error) {
			throw new Error("Failed to update calendar link");
		}

		return {
			success: true,
			message: "Calendar link updated successfully",
		};
	});
