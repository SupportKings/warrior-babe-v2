"use server";

import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";
import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const inputSchema = z.object({
	id: z.string().uuid("Invalid certification ID"),
});

export const deleteCertification = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput }) => {
		try {
			const supabase = await createClient();

			// Check if any users have this certification
			const { data: userCertifications } = await supabase
				.from("user_certifications")
				.select("id")
				.eq("certification_id", parsedInput.id)
				.limit(1);

			if (userCertifications && userCertifications.length > 0) {
				return returnValidationErrors(inputSchema, {
					_errors: ["Cannot delete certification that is assigned to users. Please deactivate it instead."],
				});
			}

			// Delete the certification
			const { error } = await supabase
				.from("certifications")
				.delete()
				.eq("id", parsedInput.id);

			if (error) {
				console.error("Error deleting certification:", error);
				return returnValidationErrors(inputSchema, {
					_errors: ["Failed to delete certification"],
				});
			}

			return {
				success: true,
			};
		} catch (error) {
			console.error("Unexpected error in deleteCertification:", error);
			return returnValidationErrors(inputSchema, {
				_errors: ["An unexpected error occurred"],
			});
		}
	});