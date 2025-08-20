"use server";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const inputSchema = z.object({
	name: z
		.string()
		.min(1, "Certification name is required")
		.max(100, "Name is too long"),
	issuer: z
		.string()
		.min(1, "Issuer is required")
		.max(100, "Issuer name is too long"),
	description: z
		.string()
		.max(500, "Description is too long")
		.optional()
		.nullable(),
	icon: z.string().url("Invalid icon URL").optional().nullable(),
});

export const createCertificationType = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput }) => {
		try {
			const supabase = await createClient();

			// Check if certification type already exists (by name and issuer)
			const { data: existing } = await supabase
				.from("certifications")
				.select("id")
				.eq("name", parsedInput.name)
				.eq("issuer", parsedInput.issuer)
				.single();

			if (existing) {
				return returnValidationErrors(inputSchema, {
					_errors: ["A certification with this name and issuer already exists"],
				});
			}

			// Create the certification type
			const { data, error } = await supabase
				.from("certifications")
				.insert({
					name: parsedInput.name,
					issuer: parsedInput.issuer,
					description: parsedInput.description || null,
					icon: parsedInput.icon || null,
					is_active: true,
				})
				.select()
				.single();

			if (error) {
				console.error("Error creating certification type:", error);
				return returnValidationErrors(inputSchema, {
					_errors: ["Failed to create certification type"],
				});
			}

			return {
				success: true,
				data,
			};
		} catch (error) {
			console.error("Unexpected error in createCertificationType:", error);
			return returnValidationErrors(inputSchema, {
				_errors: ["An unexpected error occurred"],
			});
		}
	});
