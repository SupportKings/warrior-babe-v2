import { z } from "zod";

// Form input types for coach payments
export const coachPaymentFormSchema = z.object({
	coach_id: z.string().min(1, "Coach is required"),
	amount: z.number().positive("Amount must be positive"),
	status: z.enum(["Paid", "Not Paid"]),
	date: z.string(),
});

export type CoachPaymentFormInput = z.infer<typeof coachPaymentFormSchema>;

export const coachPaymentEditFormSchema = z.object({
	id: z.string(),
	coach_id: z.string().min(1, "Coach is required"),
	amount: z.number().positive("Amount must be positive"),
	status: z.enum(["Paid", "Not Paid"]),
	date: z.string(),
});

export type CoachPaymentEditFormInput = z.infer<typeof coachPaymentEditFormSchema>;