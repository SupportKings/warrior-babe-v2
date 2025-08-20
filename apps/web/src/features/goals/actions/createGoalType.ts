"use server";

import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";
import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const inputSchema = z.object({
	name: z
		.string()
		.min(1, "Goal type name is required")
		.max(100, "Name is too long"),
	category: z
		.string()
		.max(50, "Category is too long")
		.optional()
		.nullable(),
	category_id: z.string().uuid().optional(),
	description: z
		.string()
		.max(500, "Description is too long")
		.optional()
		.nullable(),
	icon: z.string().max(50, "Icon is too long").optional().nullable(),
	is_measurable: z.boolean().optional().nullable(),
	unit_of_measure: z
		.string()
		.max(50, "Unit of measure is too long")
		.optional()
		.nullable(),
	default_duration_days: z
		.number()
		.min(1, "Duration must be at least 1 day")
		.max(365, "Duration cannot exceed 365 days")
		.optional()
		.nullable(),
});

export const createGoalType = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput }) => {
		try {
			const supabase = await createClient();

			// Check if goal type already exists
			const { data: existing } = await supabase
				.from("goal_types")
				.select("id")
				.eq("name", parsedInput.name)
				.single();

			if (existing) {
				return returnValidationErrors(inputSchema, {
					_errors: ["A goal type with this name already exists"],
				});
			}

			// Create the goal type
			const { data, error } = await supabase
				.from("goal_types")
				.insert({
					name: parsedInput.name,
					category: parsedInput.category || null,
					category_id: parsedInput.category_id || null,
					description: parsedInput.description || null,
					icon: parsedInput.icon || null,
					is_measurable: parsedInput.is_measurable ?? false,
					unit_of_measure: parsedInput.unit_of_measure || null,
					default_duration_days: parsedInput.default_duration_days || null,
					is_active: true,
				})
				.select()
				.single();

			if (error) {
				console.error("Error creating goal type:", error);
				return returnValidationErrors(inputSchema, {
					_errors: ["Failed to create goal type"],
				});
			}

			return {
				success: true,
				data,
			};
		} catch (error) {
			console.error("Unexpected error in createGoalType:", error);
			return returnValidationErrors(inputSchema, {
				_errors: ["An unexpected error occurred"],
			});
		}
	});