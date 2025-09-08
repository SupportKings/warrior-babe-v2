"use server";

import { actionClient } from "@/lib/safe-action";
import { clientTestimonialCreateSchema } from "@/features/client-testimonials/types/client-testimonials";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { returnValidationErrors } from "next-safe-action";
import { getUser } from "@/queries/getUser";

export const createClientTestimonial = actionClient
	.inputSchema(clientTestimonialCreateSchema)
	.action(async ({ parsedInput }) => {
		// Authentication check
		const user = await getUser();
		if (!user) {
			returnValidationErrors(clientTestimonialCreateSchema, {
				_errors: ["You must be logged in to create a testimonial"],
			});
		}

		const supabase = await createClient();

		// If no recorded_by is provided, use the current user's ID
		const testimonialData = {
			...parsedInput,
			recorded_by: parsedInput.recorded_by || user?.user.id,
		};

		// Insert the testimonial
		const { data, error } = await supabase
			.from("client_testimonials")
			.insert(testimonialData)
			.select()
			.single();

		if (error) {
			console.error("Error creating testimonial:", error);
			
			// Handle specific database errors
			if (error.code === "23503") {
				// Foreign key violation
				if (error.message.includes("client_id")) {
					returnValidationErrors(clientTestimonialCreateSchema, {
						client_id: {
							_errors: ["Invalid client selected"],
						},
					});
				}
				if (error.message.includes("recorded_by")) {
					returnValidationErrors(clientTestimonialCreateSchema, {
						recorded_by: {
							_errors: ["Invalid user selected"],
						},
					});
				}
			}

			returnValidationErrors(clientTestimonialCreateSchema, {
				_errors: ["Failed to create testimonial. Please try again."],
			});
		}

		// Revalidate relevant paths
		revalidatePath("/dashboard/clients/testimonials");
		if (parsedInput.client_id) {
			revalidatePath(`/dashboard/clients/${parsedInput.client_id}`);
		}

		return {
			success: true,
			data,
			message: "Testimonial created successfully",
		};
	});