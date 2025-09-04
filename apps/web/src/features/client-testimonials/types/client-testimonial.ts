import { z } from "zod";

export const clientTestimonialUpdateSchema = z.object({
	id: z.string().uuid(),
	client_id: z.string().uuid().nullable().optional(),
	testimonial_type: z
		.string()
		.min(1, "Testimonial type is required")
		.optional(),
	content: z.string().min(1, "Content is required").optional(),
	testimonial_url: z
		.string()
		.url("Must be a valid URL")
		.nullable()
		.optional()
		.or(z.literal("")),
	recorded_date: z.string().optional(),
	recorded_by: z.string().uuid().nullable().optional(),
});

export type ClientTestimonialUpdate = z.infer<
	typeof clientTestimonialUpdateSchema
>;
