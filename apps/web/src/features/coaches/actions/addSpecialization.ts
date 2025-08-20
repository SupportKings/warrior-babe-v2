"use server";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const inputSchema = z.object({
	userId: z.string().min(1, "User ID is required"),
	specializationId: z.string().uuid("Invalid specialization ID"),
	isPrimary: z.boolean().default(false),
});

export const addSpecialization = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput }) => {
		try {
			const supabase = await createClient();

			// Check if user already has this specialization
			const { data: existing } = await supabase
				.from("user_specializations")
				.select("id")
				.eq("user_id", parsedInput.userId)
				.eq("specialization_id", parsedInput.specializationId)
				.single();

			if (existing) {
				return returnValidationErrors(inputSchema, {
					_errors: ["User already has this specialization"],
				});
			}

			// If setting as primary, unset other primary specializations
			if (parsedInput.isPrimary) {
				await supabase
					.from("user_specializations")
					.update({ is_primary: false })
					.eq("user_id", parsedInput.userId)
					.eq("is_primary", true);
			}

			// Add the specialization
			const { data, error } = await supabase
				.from("user_specializations")
				.insert({
					user_id: parsedInput.userId,
					specialization_id: parsedInput.specializationId,
					is_primary: parsedInput.isPrimary,
				})
				.select(`
					*,
					specialization:specializations(*)
				`)
				.single();

			if (error) {
				console.error("Error adding specialization:", error);
				return returnValidationErrors(inputSchema, {
					_errors: ["Failed to add specialization"],
				});
			}

			return {
				success: true,
				data,
			};
		} catch (error) {
			console.error("Unexpected error in addSpecialization:", error);
			return returnValidationErrors(inputSchema, {
				_errors: ["An unexpected error occurred"],
			});
		}
	});
