"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const deleteSchema = z.object({
	id: z.string().uuid(),
});

export const deleteClientTestimonial = actionClient
	.inputSchema(deleteSchema)
	.action(async ({ parsedInput }) => {
		const { id } = parsedInput;

		try {
			const supabase = await createClient();

			// 1. Check if testimonial exists and get client_id for revalidation
			const { data: existingTestimonial, error: fetchError } = await supabase
				.from("client_testimonials")
				.select("id, client_id")
				.eq("id", id)
				.single();

			if (fetchError || !existingTestimonial) {
				return returnValidationErrors(deleteSchema, {
					_errors: ["Testimonial not found"],
				});
			}

			// 2. Delete the testimonial
			const { error: deleteError } = await supabase
				.from("client_testimonials")
				.delete()
				.eq("id", id);

			if (deleteError) {
				console.error("Error deleting testimonial:", deleteError);
				return returnValidationErrors(deleteSchema, {
					_errors: ["Failed to delete testimonial. Please try again."],
				});
			}

			// 3. Revalidate relevant paths
			revalidatePath("/dashboard/clients/testimonials");
			if (existingTestimonial.client_id) {
				revalidatePath(`/dashboard/clients/${existingTestimonial.client_id}`);
			}

			return {
				success: true,
				data: {
					success: "Testimonial deleted successfully",
				},
			};
		} catch (error) {
			console.error("Unexpected error in deleteClientTestimonial:", error);

			return returnValidationErrors(deleteSchema, {
				_errors: ["Failed to delete testimonial. Please try again."],
			});
		}
	});
