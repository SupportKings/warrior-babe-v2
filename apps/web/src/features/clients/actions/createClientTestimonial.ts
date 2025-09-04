"use server";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

const createClientTestimonialSchema = z.object({
	client_id: z.string().uuid("Invalid client ID"),
	content: z.string().min(1, "Content is required"),
	testimonial_type: z.enum(["written", "email", "video"], "Type is required"),
	testimonial_url: z.string().url().optional().or(z.literal("")),
	recorded_by: z.string().uuid("Invalid user ID").optional(),
	recorded_date: z.string(),
});

export const createClientTestimonialAction = actionClient
	.inputSchema(createClientTestimonialSchema)
	.action(async ({ parsedInput }) => {
		try {
			const supabase = await createClient();

			const { data, error } = await supabase
				.from("client_testimonials")
				.insert(parsedInput)
				.select()
				.single();

			if (error) {
				console.error("Error creating client testimonial:", error);
				return {
					success: false,
					error: "Failed to create client testimonial",
				};
			}

			return {
				success: true,
				data,
			};
		} catch (error) {
			console.error("Unexpected error in createClientTestimonial:", error);
			return {
				success: false,
				error: "An unexpected error occurred",
			};
		}
	});
