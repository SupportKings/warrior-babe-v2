import { z } from "zod";
import type { Tables } from "@/utils/supabase/database.types";

// Main entity type
export type ClientTestimonial = Tables<"client_testimonials">;

// Entity with relations type
export type ClientTestimonialWithRelations = ClientTestimonial & {
  client?: Tables<"clients"> | null;
  recorded_by_user?: Tables<"user"> | null;
};

// Testimonial type options
export const TESTIMONIAL_TYPE_OPTIONS = [
  { value: "written", label: "Written" },
  { value: "email", label: "Email" },
  { value: "video", label: "Video" },
] as const;

// Validation utilities
const validationUtils = {
  // String validations
  stringRequired: (fieldName: string, min = 1, max = 255) =>
    z
      .string({
        message: `${fieldName} is required`,
      })
      .min(min, `${fieldName} must be at least ${min} characters`)
      .max(max, `${fieldName} must be at most ${max} characters`),

  // Optional string
  stringOptional: (fieldName: string, max = 255) =>
    z
      .string()
      .max(max, `${fieldName} must be at most ${max} characters`)
      .nullable()
      .optional(),

  // URL validation
  urlOptional: () =>
    z
      .string()
      .url("Must be a valid URL")
      .nullable()
      .optional()
      .or(z.literal("").transform(() => null)),

  // Date validation (YYYY-MM-DD)
  dateRequired: (fieldName: string) =>
    z
      .string({
        message: `${fieldName} is required`,
      })
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        `${fieldName} must be in YYYY-MM-DD format`
      ),

  // UUID validation
  uuidOptional: () =>
    z
      .uuid("Must be a valid UUID")
      .nullable()
      .optional()
      .or(z.literal("").transform(() => null)),

  // Enum validation
  testimonialType: () =>
    z.enum(["written", "email", "video"], {
      message: "Testimonial type is required",
    }),
};

// Create schema - strict validation for server
export const clientTestimonialCreateSchema = z.object({
  client_id: validationUtils.uuidOptional(),
  content: validationUtils.stringRequired("Content", 1, 5000),
  recorded_by: z.string(),
  recorded_date: validationUtils.dateRequired("Recorded date"),
  testimonial_type: validationUtils.testimonialType(),
  testimonial_url: validationUtils.urlOptional(),
});

// Update schema - with optional fields and ID required
export const clientTestimonialUpdateSchema = z.object({
  id: z.string().uuid("Invalid testimonial ID"),
  client_id: validationUtils.uuidOptional(),
  content: validationUtils.stringRequired("Content", 1, 5000).optional(),
  recorded_by: validationUtils.uuidOptional(),
  recorded_date: validationUtils.dateRequired("Recorded date").optional(),
  testimonial_type: validationUtils.testimonialType().optional(),
  testimonial_url: validationUtils.urlOptional(),
});

// Form schema - form-friendly with defaults
export const clientTestimonialFormSchema = z.object({
  client_id: z.string().default(""),
  content: z.string().default(""),
  recorded_by: z.string().default(""),
  recorded_date: z.string().default(new Date().toISOString().split("T")[0]),
  testimonial_type: z.string().default("written"),
  testimonial_url: z.string().default(""),
});

// Edit form schema - extending form schema with ID
export const clientTestimonialEditFormSchema =
  clientTestimonialFormSchema.extend({
    id: z.string().uuid(),
  });

// TypeScript types for schemas
export type ClientTestimonialCreate = z.infer<
  typeof clientTestimonialCreateSchema
>;
export type ClientTestimonialUpdate = z.infer<
  typeof clientTestimonialUpdateSchema
>;
export type ClientTestimonialForm = z.infer<typeof clientTestimonialFormSchema>;
export type ClientTestimonialEditForm = z.infer<
  typeof clientTestimonialEditFormSchema
>;

// Validation helper functions
export const validateSingleField = (
  fieldName: keyof ClientTestimonialForm,
  value: any
) => {
  try {
    const fieldSchema = clientTestimonialCreateSchema.shape[fieldName];
    if (fieldSchema) {
      fieldSchema.parse(value);
    }
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation failed",
      };
    }
    return { success: false, error: "Validation failed" };
  }
};

export const getAllValidationErrors = (error: unknown) => {
  if (error instanceof z.ZodError) {
    const errors: Record<string, string[]> = {};
    error.issues.forEach((issue) => {
      const path = issue.path.join(".");
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(issue.message);
    });
    return errors;
  }
  return {};
};
