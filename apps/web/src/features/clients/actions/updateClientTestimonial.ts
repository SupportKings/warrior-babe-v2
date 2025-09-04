"use server";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

const updateClientTestimonialSchema = z.object({
	id: z.string().uuid("Invalid testimonial ID"),
	client_id: z.string().uuid("Invalid client ID").optional(),
	content: z.string().min(1, "Content is required").optional(),
	testimonial_type: z.enum(["written", "email", "video"], "Type is required").optional(),
	testimonial_url: z.string().url().optional().or(z.literal("")).optional(),
	recorded_by: z.string().uuid("Invalid user ID").optional(),
	recorded_date: z.string().optional(),
});

export const updateClientTestimonialAction = actionClient
	.inputSchema(updateClientTestimonialSchema)
	.action(async ({ parsedInput }) => {
		try {
			const supabase = await createClient();

			const { id, ...updateData } = parsedInput;

			const { data, error } = await supabase
				.from("client_testimonials")
				.update(updateData)
				.eq("id", id)
				.select()
				.single();

			if (error) {
				console.error("Error updating client testimonial:", error);
				return {
					success: false,
					error: "Failed to update client testimonial",
				};
			}

			return {
				success: true,
				data,
			};
		} catch (error) {
			console.error("Unexpected error in updateClientTestimonial:", error);
			return {
				success: false,
				error: "An unexpected error occurred",
			};
		}
	});
