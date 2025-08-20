"use server";

import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const inputSchema = z.object({
	userId: z.string().min(1, "User ID is required"),
	certificationId: z.string().uuid("Invalid certification ID"),
	dateAchieved: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
	expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().nullable(),
	certificateUrl: z.string().url("Invalid URL").optional().nullable(),
	verified: z.boolean().default(false),
});

export const addCertification = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput }) => {
		try {
			const supabase = await createClient();

			// Check if user already has this certification
			const { data: existing } = await supabase
				.from("user_certifications")
				.select("id")
				.eq("user_id", parsedInput.userId)
				.eq("certification_id", parsedInput.certificationId)
				.single();

			if (existing) {
				return returnValidationErrors(inputSchema, {
					_errors: ["User already has this certification"],
				});
			}

			// Add the certification
			const { data, error } = await supabase
				.from("user_certifications")
				.insert({
					user_id: parsedInput.userId,
					certification_id: parsedInput.certificationId,
					date_achieved: parsedInput.dateAchieved,
					expiry_date: parsedInput.expiryDate || null,
					certificate_url: parsedInput.certificateUrl || null,
					verified: parsedInput.verified,
				})
				.select(`
					*,
					certification:certifications(*)
				`)
				.single();

			if (error) {
				console.error("Error adding certification:", error);
				return returnValidationErrors(inputSchema, {
					_errors: ["Failed to add certification"],
				});
			}

			return {
				success: true,
				data,
			};
		} catch (error) {
			console.error("Unexpected error in addCertification:", error);
			return returnValidationErrors(inputSchema, {
				_errors: ["An unexpected error occurred"],
			});
		}
	});