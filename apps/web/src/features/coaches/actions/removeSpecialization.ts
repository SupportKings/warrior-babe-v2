"use server";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const inputSchema = z.object({
	userSpecializationId: z.string().uuid("Invalid specialization ID"),
});

export const removeSpecialization = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput }) => {
		try {
			const supabase = await createClient();

			// Delete the specialization
			const { error } = await supabase
				.from("user_specializations")
				.delete()
				.eq("id", parsedInput.userSpecializationId);

			if (error) {
				console.error("Error removing specialization:", error);
				return returnValidationErrors(inputSchema, {
					_errors: ["Failed to remove specialization"],
				});
			}

			return {
				success: true,
			};
		} catch (error) {
			console.error("Unexpected error in removeSpecialization:", error);
			return returnValidationErrors(inputSchema, {
				_errors: ["An unexpected error occurred"],
			});
		}
	});
