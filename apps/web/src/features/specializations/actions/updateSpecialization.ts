"use server";

import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";
import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const inputSchema = z.object({
	id: z.string().uuid("Invalid specialization ID"),
	name: z
		.string()
		.min(1, "Specialization name is required")
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
	icon: z.string().max(50, "Icon key is too long").optional().nullable(),
	is_active: z.boolean(),
});

export const updateSpecialization = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput }) => {
		try {
			const supabase = await createClient();

			// Check if another specialization with the same name exists
			const { data: existing } = await supabase
				.from("specializations")
				.select("id")
				.eq("name", parsedInput.name)
				.neq("id", parsedInput.id);

			if (existing && existing.length > 0) {
				return returnValidationErrors(inputSchema, {
					_errors: ["A specialization with this name already exists"],
				});
			}

			// Update the specialization
			const { data, error } = await supabase
				.from("specializations")
				.update({
					name: parsedInput.name,
					category: parsedInput.category || null,
					category_id: parsedInput.category_id || null,
					description: parsedInput.description || null,
					icon: parsedInput.icon || null,
					is_active: parsedInput.is_active,
					updated_at: new Date().toISOString(),
				})
				.eq("id", parsedInput.id)
				.select()
				.single();

			if (error) {
				console.error("Error updating specialization:", error);
				return returnValidationErrors(inputSchema, {
					_errors: ["Failed to update specialization"],
				});
			}

			return {
				success: true,
				data,
			};
		} catch (error) {
			console.error("Unexpected error in updateSpecialization:", error);
			return returnValidationErrors(inputSchema, {
				_errors: ["An unexpected error occurred"],
			});
		}
	});