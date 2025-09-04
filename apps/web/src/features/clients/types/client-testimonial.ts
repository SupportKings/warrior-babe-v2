import { z } from "zod";

// Form input types for client testimonials
export const clientTestimonialFormSchema = z.object({
	client_id: z.string().min(1, "Client is required"),
	content: z.string().min(1, "Content is required"),
	testimonial_type: z.enum(["written", "email", "video"], "Type is required"),
	testimonial_url: z.string().url().optional().or(z.literal("")),
	recorded_by: z.string().optional(),
	recorded_date: z.string(),
});

export type ClientTestimonialFormInput = z.infer<
	typeof clientTestimonialFormSchema
>;

export const clientTestimonialEditFormSchema = z.object({
	id: z.string(),
	client_id: z.string().min(1, "Client is required"),
	content: z.string().min(1, "Content is required"),
	testimonial_type: z.enum(["written", "email", "video"], "Type is required"),
	testimonial_url: z.string().url().optional().or(z.literal("")),
	recorded_by: z.string().optional(),
	recorded_date: z.string(),
});

export type ClientTestimonialEditFormInput = z.infer<
	typeof clientTestimonialEditFormSchema
>;
