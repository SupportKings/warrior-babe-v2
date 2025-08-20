"use server";

import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";
import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const inputSchema = z.object({
	id: z.string().uuid("Invalid goal type ID"),
});

export const deleteGoalType = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput }) => {
		try {
			const supabase = await createClient();

			// Check if goal type is being used by any client goals
			const { data: usageCount } = await supabase
				.from("client_goals")
				.select("id", { count: "exact", head: true })
				.eq("goal_type_id", parsedInput.id);

			if (usageCount && usageCount.length > 0) {
				return returnValidationErrors(inputSchema, {
					_errors: ["Cannot delete goal type that is being used by client goals"],
				});
			}

			// Soft delete by setting is_active to false
			const { data, error } = await supabase
				.from("goal_types")
				.update({
					is_active: false,
					updated_at: new Date().toISOString(),
				})
				.eq("id", parsedInput.id)
				.select()
				.single();

			if (error) {
				console.error("Error deleting goal type:", error);
				return returnValidationErrors(inputSchema, {
					_errors: ["Failed to delete goal type"],
				});
			}

			return {
				success: true,
				data,
			};
		} catch (error) {
			console.error("Unexpected error in deleteGoalType:", error);
			return returnValidationErrors(inputSchema, {
				_errors: ["An unexpected error occurred"],
			});
		}
	});