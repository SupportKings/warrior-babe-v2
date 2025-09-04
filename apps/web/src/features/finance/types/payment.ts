import { z } from "zod";

// Payment update schema for detail page
export const paymentUpdateSchema = z.object({
	id: z.string().uuid("Invalid payment ID"),
	amount: z.number().min(0).optional(),
	payment_date: z.string().optional(),
	payment_method: z.string().optional(),
	stripe_transaction_id: z.string().optional().nullable(),
	status: z.string().optional(),
	platform: z.string().optional(),
	declined_at: z.string().optional().nullable(),
	disputed_status: z.enum([
		"Not Disputed",
		"Disputed", 
		"Evidence Submitted",
		"Dispute Won",
		"Dispute Lost"
	]).optional(),
	dispute_fee: z.number().min(0).optional().nullable(),
});

export type PaymentUpdate = z.infer<typeof paymentUpdateSchema>;

// Payment type for display
export interface Payment {
	id: string;
	amount: number | null;
	payment_date: string | null;
	payment_method: string | null;
	stripe_transaction_id: string | null;
	status: string | null;
	platform: string | null;
	declined_at: string | null;
	disputed_status: string | null;
	dispute_fee: number | null;
	created_at: string;
	updated_at: string;
	payment_slots?: PaymentSlot[];
}

export interface PaymentSlot {
	id: string;
	amount_due: number;
	amount_paid: number;
	due_date: string;
	notes: string | null;
	plan_id: string | null;
	payment_plans?: PaymentPlan | null;
}

export interface PaymentPlan {
	id: string;
	name: string;
	platform: string | null;
	product_id: string | null;
	client_id: string | null;
	total_amount: number | null;
	type: string | null;
	clients?: Client | null;
	products?: Product | null;
}

export interface Client {
	id: string;
	name: string;
	email: string;
}

export interface Product {
	id: string;
	name: string;
}