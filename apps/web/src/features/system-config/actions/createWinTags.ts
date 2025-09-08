"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { winTagCreateSchema } from "@/features/system-config/types/win-tags";

import { returnValidationErrors } from "next-safe-action";
import { getUser } from "@/queries/getUser";

export const createWinTag = actionClient
	.inputSchema(winTagCreateSchema)
	.action(async ({ parsedInput }) => {
		// Check authentication
		const user = await getUser();
		if (!user) {
			return returnValidationErrors(winTagCreateSchema, {
				_errors: ["You must be logged in to create a win tag"],
			});
		}

		const supabase = await createClient();

		// Check if a tag with the same name already exists
		const { data: existingTag, error: checkError } = await supabase
			.from("win_tags")
			.select("id")
			.eq("name", parsedInput.name)
			.single();

		if (existingTag) {
			return returnValidationErrors(winTagCreateSchema, {
				name: {
					_errors: ["A win tag with this name already exists"],
				},
			});
		}

		// Create the win tag
		const { data, error } = await supabase
			.from("win_tags")
			.insert({
				name: parsedInput.name,
				color: parsedInput.color,
			})
			.select()
			.single();

		if (error) {
			console.error("Error creating win tag:", error);
			return returnValidationErrors(winTagCreateSchema, {
				_errors: ["Failed to create win tag. Please try again."],
			});
		}

		// Revalidate relevant paths
		revalidatePath("/dashboard/system-config/client-win-tags");
		revalidatePath("/dashboard/system-config/client-win-tags/add");

		return {
			success: true,
			data,
		};
	});
