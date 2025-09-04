"use server";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

const deleteClientTestimonialSchema = z.object({
	id: z.string().uuid("Invalid testimonial ID"),
});

export const deleteClientTestimonial = actionClient
	.inputSchema(deleteClientTestimonialSchema)
	.action(async ({ parsedInput }) => {
		try {
			const supabase = await createClient();

			const { error } = await supabase
				.from("client_testimonials")
				.delete()
				.eq("id", parsedInput.id);

			if (error) {
				console.error("Error deleting client testimonial:", error);
				return {
					success: false,
					error: "Failed to delete client testimonial",
				};
			}

			return {
				success: true,
			};
		} catch (error) {
			console.error("Unexpected error in deleteClientTestimonial:", error);
			return {
				success: false,
				error: "An unexpected error occurred",
			};
		}
	});
