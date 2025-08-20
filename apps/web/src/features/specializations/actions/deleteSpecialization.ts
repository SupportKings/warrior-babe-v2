"use server";

import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";
import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const inputSchema = z.object({
	id: z.string().uuid("Invalid specialization ID"),
});

export const deleteSpecialization = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput }) => {
		try {
			const supabase = await createClient();

			// Check if any users have this specialization
			const { data: userSpecializations } = await supabase
				.from("user_specializations")
				.select("id")
				.eq("specialization_id", parsedInput.id)
				.limit(1);

			if (userSpecializations && userSpecializations.length > 0) {
				return returnValidationErrors(inputSchema, {
					_errors: ["Cannot delete specialization that is assigned to users. Please deactivate it instead."],
				});
			}

			// Delete the specialization
			const { error } = await supabase
				.from("specializations")
				.delete()
				.eq("id", parsedInput.id);

			if (error) {
				console.error("Error deleting specialization:", error);
				return returnValidationErrors(inputSchema, {
					_errors: ["Failed to delete specialization"],
				});
			}

			return {
				success: true,
			};
		} catch (error) {
			console.error("Unexpected error in deleteSpecialization:", error);
			return returnValidationErrors(inputSchema, {
				_errors: ["An unexpected error occurred"],
			});
		}
	});