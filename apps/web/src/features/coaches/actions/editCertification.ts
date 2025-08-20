"use server";

import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const inputSchema = z.object({
	userCertificationId: z.string().uuid("Invalid certification ID"),
	certificationId: z.string().uuid("Invalid certification ID"),
	dateAchieved: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
	expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().nullable(),
	certificateUrl: z.string().url("Invalid URL").optional().nullable(),
	verified: z.boolean().default(false),
});

export const editCertification = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput }) => {
		try {
			const supabase = await createClient();

			// Update the certification
			const { data, error } = await supabase
				.from("user_certifications")
				.update({
					certification_id: parsedInput.certificationId,
					date_achieved: parsedInput.dateAchieved,
					expiry_date: parsedInput.expiryDate || null,
					certificate_url: parsedInput.certificateUrl || null,
					verified: parsedInput.verified,
				})
				.eq("id", parsedInput.userCertificationId)
				.select(`
					*,
					certification:certifications(*)
				`)
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
			console.error("Unexpected error in editCertification:", error);
			return returnValidationErrors(inputSchema, {
				_errors: ["An unexpected error occurred"],
			});
		}
	});