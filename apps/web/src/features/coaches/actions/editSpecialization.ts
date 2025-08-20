"use server";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const inputSchema = z.object({
	userSpecializationId: z.string().uuid("Invalid specialization ID"),
	specializationId: z.string().uuid("Invalid specialization ID"),
	isPrimary: z.boolean().default(false),
});

export const editSpecialization = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput }) => {
		try {
			const supabase = await createClient();

			// Get the current user_id from the specialization
			const { data: currentSpec } = await supabase
				.from("user_specializations")
				.select("user_id")
				.eq("id", parsedInput.userSpecializationId)
				.single();

			if (!currentSpec) {
				return returnValidationErrors(inputSchema, {
					_errors: ["Specialization not found"],
				});
			}

			// If setting as primary, unset other primary specializations
			if (parsedInput.isPrimary) {
				await supabase
					.from("user_specializations")
					.update({ is_primary: false })
					.eq("user_id", currentSpec.user_id)
					.eq("is_primary", true)
					.neq("id", parsedInput.userSpecializationId);
			}

			// Update the specialization
			const { data, error } = await supabase
				.from("user_specializations")
				.update({
					specialization_id: parsedInput.specializationId,
					is_primary: parsedInput.isPrimary,
				})
				.eq("id", parsedInput.userSpecializationId)
				.select(`
					*,
					specialization:specializations(*)
				`)
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
			console.error("Unexpected error in editSpecialization:", error);
			return returnValidationErrors(inputSchema, {
				_errors: ["An unexpected error occurred"],
			});
		}
	});
