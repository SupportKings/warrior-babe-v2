import type { Tables } from "@/utils/supabase/database.types";

import { z } from "zod";

// Main entity type
export type Payment = Tables<"payments">;

// Status options from database
export const PAYMENT_STATUS_OPTIONS = ["paid", "not_paid"] as const;

// Platform options (common payment platforms)
export const PAYMENT_PLATFORM_OPTIONS = ["stripe"] as const;

// Payment method options
export const PAYMENT_METHOD_OPTIONS = [
  "stripe",
  "credit_card",
  "link",
  "card",
  "revolut",
] as const;

// Validation utilities
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// Helper function to validate single fields
export const validateSingleField = (
  field: string,
  value: unknown
): { isValid: boolean; error?: string } => {
  try {
    const fieldSchema =
      paymentCreateSchema.shape[
        field as keyof typeof paymentCreateSchema.shape
      ];
    if (fieldSchema) {
      fieldSchema.parse(value);
      return { isValid: true };
    }
    return { isValid: false, error: "Unknown field" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error?.message };
    }
    return { isValid: false, error: "Validation failed" };
  }
};

// Helper function to get all validation errors
export const getAllValidationErrors = (errors: any): string[] => {
  if (!errors || !errors.errors) return [];
  return errors.errors.map((error: any) => error.message);
};

// Comprehensive validation schemas
export const paymentCreateSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .transform((val) => Number.parseFloat(val))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: "Amount must be a positive number",
    }),
  payment_date: z
    .string()
    .min(1, "Payment date is required")
    .refine((date) => dateRegex.test(date), {
      message: "Date must be in YYYY-MM-DD format",
    }),
  payment_method: z
    .string()
    .min(1, "Payment method is required")
    .refine((val) => PAYMENT_METHOD_OPTIONS.includes(val as any), {
      message: "Invalid payment method",
    }),
  platform: z
    .string()
    .min(1, "Platform is required")
    .refine((val) => PAYMENT_PLATFORM_OPTIONS.includes(val as any), {
      message: "Invalid platform",
    }),
  status: z
    .string()
    .min(1, "Status is required")
    .refine((val) => PAYMENT_STATUS_OPTIONS.includes(val as any), {
      message: "Invalid status",
    }),
});

// Payment update schema for detail page
export const paymentUpdateSchema = z.object({
  id: z.string().uuid("Invalid payment ID"),
  amount: z
    .string()
    .transform((val) => Number.parseFloat(val))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: "Amount must be a positive number",
    })
    .optional(),
  payment_date: z
    .string()
    .refine((date) => dateRegex.test(date), {
      message: "Date must be in YYYY-MM-DD format",
    })
    .optional(),
  payment_method: z
    .string()
    .refine((val) => PAYMENT_METHOD_OPTIONS.includes(val as any), {
      message: "Invalid payment method",
    })
    .optional(),
  stripe_transaction_id: z.string().optional().nullable(),
  status: z
    .string()
    .refine((val) => PAYMENT_STATUS_OPTIONS.includes(val as any), {
      message: "Invalid status",
    })
    .optional(),
  platform: z
    .string()
    .refine((val) => PAYMENT_PLATFORM_OPTIONS.includes(val as any), {
      message: "Invalid platform",
    })
    .optional(),
  declined_at: z.string().optional().nullable(),
  disputed_status: z
    .enum([
      "Not Disputed",
      "Disputed",
      "Evidence Submitted",
      "Dispute Won",
      "Dispute Lost",
    ])
    .optional(),
  dispute_fee: z.number().min(0).optional().nullable(),
});

// Form-friendly schemas with string inputs
export const paymentFormSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  payment_date: z.string().min(1, "Payment date is required"),
  payment_method: z.string().min(1, "Payment method is required"),
  platform: z.string().min(1, "Platform is required"),
  status: z.string().min(1, "Status is required"),
});

export const paymentEditFormSchema = paymentFormSchema.extend({
  id: z.string().uuid("Invalid payment ID"),
});

// TypeScript types for schemas
export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
export type PaymentUpdate = z.infer<typeof paymentUpdateSchema>;
export type PaymentFormInput = z.infer<typeof paymentFormSchema>;
export type PaymentEditFormInput = z.infer<typeof paymentEditFormSchema>;

// Payment type for display with relations
export interface PaymentWithSlots extends Payment {
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
