"use server";

import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";
import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const inputSchema = z.object({
	id: z.string().uuid("Invalid certification ID"),
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
	is_active: z.boolean(),
});

export const updateCertification = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput }) => {
		try {
			const supabase = await createClient();

			// Check if another certification with the same name and issuer exists
			const { data: existing } = await supabase
				.from("certifications")
				.select("id")
				.eq("name", parsedInput.name)
				.eq("issuer", parsedInput.issuer)
				.neq("id", parsedInput.id)
				.single();

			if (existing) {
				return returnValidationErrors(inputSchema, {
					_errors: ["A certification with this name and issuer already exists"],
				});
			}

			// Update the certification
			const { data, error } = await supabase
				.from("certifications")
				.update({
					name: parsedInput.name,
					issuer: parsedInput.issuer,
					description: parsedInput.description || null,
					icon: parsedInput.icon || null,
					is_active: parsedInput.is_active,
					updated_at: new Date().toISOString(),
				})
				.eq("id", parsedInput.id)
				.select()
				.single();

			if (error) {
				console.error("Error updating certification:", error);
				return returnValidationErrors(inputSchema, {
					_errors: ["Failed to update certification"],
				});
			}

			return {
				success: true,
				data,
			};
		} catch (error) {
			console.error("Unexpected error in updateCertification:", error);
			return returnValidationErrors(inputSchema, {
				_errors: ["An unexpected error occurred"],
			});
		}
	});