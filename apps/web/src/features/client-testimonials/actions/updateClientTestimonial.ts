"use server";

import { revalidatePath } from "next/cache";
import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";
import { clientTestimonialUpdateSchema } from "@/features/client-testimonials/types/client-testimonial";
import { returnValidationErrors } from "next-safe-action";

export const updateClientTestimonialAction = actionClient
	.inputSchema(clientTestimonialUpdateSchema)
	.action(async ({ parsedInput }) => {
		const { id, ...updateData } = parsedInput;

		try {
			const supabase = await createClient();

			// 1. Check if testimonial exists
			const { data: existingTestimonial, error: fetchError } = await supabase
				.from("client_testimonials")
				.select("id")
				.eq("id", id)
				.single();

			if (fetchError || !existingTestimonial) {
				return returnValidationErrors(clientTestimonialUpdateSchema, {
					_errors: ["Testimonial not found"],
				});
			}

			// 2. Prepare update data (remove undefined values)
			const cleanUpdateData: any = {};

			if (updateData.client_id !== undefined) {
				cleanUpdateData.client_id = updateData.client_id;
			}
			if (updateData.testimonial_type !== undefined) {
				cleanUpdateData.testimonial_type = updateData.testimonial_type;
			}
			if (updateData.content !== undefined) {
				cleanUpdateData.content = updateData.content;
			}
			if (updateData.testimonial_url !== undefined) {
				cleanUpdateData.testimonial_url = updateData.testimonial_url || null;
			}
			if (updateData.recorded_date !== undefined) {
				cleanUpdateData.recorded_date = updateData.recorded_date;
			}
			if (updateData.recorded_by !== undefined) {
				cleanUpdateData.recorded_by = updateData.recorded_by;
			}

			// 3. Update the testimonial record
			const { data: updatedTestimonial, error: updateError } = await supabase
				.from("client_testimonials")
				.update({
					...cleanUpdateData,
					updated_at: new Date().toISOString(),
				})
				.eq("id", id)
				.select()
				.single();

			if (updateError) {
				console.error("Error updating testimonial:", updateError);
				return returnValidationErrors(clientTestimonialUpdateSchema, {
					_errors: ["Failed to update testimonial. Please try again."],
				});
			}

			if (!updatedTestimonial) {
				return returnValidationErrors(clientTestimonialUpdateSchema, {
					_errors: ["Testimonial update failed. Please try again."],
				});
			}

			// 4. Revalidate relevant paths
			revalidatePath("/dashboard/clients/testimonials");
			revalidatePath(`/dashboard/clients/testimonials/${id}`);
			if (updatedTestimonial.client_id) {
				revalidatePath(`/dashboard/clients/${updatedTestimonial.client_id}`);
			}

			return {
				success: true,
				data: {
					success: "Testimonial updated successfully",
					testimonial: updatedTestimonial,
				},
			};
		} catch (error) {
			console.error("Unexpected error in updateClientTestimonial:", error);

			return returnValidationErrors(clientTestimonialUpdateSchema, {
				_errors: ["Failed to update testimonial. Please try again."],
			});
		}
	});