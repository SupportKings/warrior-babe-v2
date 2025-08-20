"use server";

import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const inputSchema = z.object({
	userCertificationId: z.string().uuid("Invalid certification ID"),
});

export const removeCertification = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput }) => {
		try {
			const supabase = await createClient();

			// Delete the certification
			const { error } = await supabase
				.from("user_certifications")
				.delete()
				.eq("id", parsedInput.userCertificationId);

			if (error) {
				console.error("Error removing certification:", error);
				return returnValidationErrors(inputSchema, {
					_errors: ["Failed to remove certification"],
				});
			}

			return {
				success: true,
			};
		} catch (error) {
			console.error("Unexpected error in removeCertification:", error);
			return returnValidationErrors(inputSchema, {
				_errors: ["An unexpected error occurred"],
			});
		}
	});