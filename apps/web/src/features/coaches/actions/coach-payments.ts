"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { format } from "date-fns";

// Validation schemas
const createCoachPaymentSchema = z.object({
  coach_id: z.uuid("Invalid coach ID"),
  client_activity_period_id: z.uuid("Invalid activity period ID"),
  amount: z.number().positive("Amount must be positive"),
  status: z.enum(["Paid", "Not Paid"], {
    message: "Status must be either 'Paid' or 'Not Paid'",
  }),
  date: z.string().min(1, "Date is required"),
});

const updateCoachPaymentSchema = z.object({
  id: z.uuid("Invalid payment ID"),
  client_activity_period_id: z.uuid("Invalid activity period ID").optional(),
  amount: z.number().positive("Amount must be positive").optional(),
  status: z
    .enum(["Paid", "Not Paid"], {
      message: "Status must be either 'Paid' or 'Not Paid'",
    })
    .optional(),
  date: z.string().min(1, "Date is required").optional(),
});

export type CreateCoachPaymentInput = z.infer<typeof createCoachPaymentSchema>;
export type UpdateCoachPaymentInput = z.infer<typeof updateCoachPaymentSchema>;

/**
 * Create a new coach payment record and revalidate the coach's details page.
 *
 * Validates `input` against the create schema, inserts a payment row, and triggers page revalidation for the related coach.
 *
 * @param input - Payment payload containing `coach_id`, `client_activity_period_id`, `amount`, `status` (`"Paid"` | `"Not Paid"`), and `date` (ISO string). Must conform to the module's validation schema.
 * @returns An object with `success: true` and `data` (the inserted payment row) and `message` on success, or `success: false` and `message` on validation or persistence failure.
 */
export async function createCoachPayment(input: CreateCoachPaymentInput) {
  try {
    const validatedInput = createCoachPaymentSchema.parse(input);
    const supabase = await createClient();

    const { data: payment, error } = await supabase
      .from("coach_payments")
      .insert({
        coach_id: validatedInput.coach_id as any,
        client_activity_period_id: validatedInput.client_activity_period_id,
        amount: validatedInput.amount,
        status: validatedInput.status,
        date: validatedInput.date, // date field in DB, not payment_date
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating coach payment:", error);
      return {
        success: false,
        message: `Failed to create payment: ${error.message}`,
      };
    }

    // Revalidate the coach details page
    revalidatePath(`/dashboard/coaches/${validatedInput.coach_id}`);

    return {
      success: true,
      data: payment,
      message: "Payment created successfully",
    };
  } catch (error) {
    console.error("Unexpected error in createCoachPayment:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.message,
      };
    }
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Update an existing coach payment record.
 *
 * Validates the provided input, applies only the supplied fields to the payment row
 * (plus an updated_at timestamp), updates the `coach_payments` table, and triggers
 * ISR revalidation for the related coach page when the coach_id can be resolved.
 *
 * @param input - Partial update payload including the payment `id` and any of:
 *   `client_activity_period_id`, `amount`, `status`, `date`. Fields not present are left unchanged.
 * @returns An object describing the operation result:
 *   - On success: `{ success: true, data: <updated payment row>, message: "Payment updated successfully" }`.
 *   - On validation or runtime failure: `{ success: false, message: <error message> }`.
 */
export async function updateCoachPayment(input: UpdateCoachPaymentInput) {
  try {
    const validatedInput = updateCoachPaymentSchema.parse(input);
    const supabase = await createClient();

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (validatedInput.client_activity_period_id !== undefined) {
      updateData.client_activity_period_id =
        validatedInput.client_activity_period_id;
    }
    if (validatedInput.amount !== undefined) {
      updateData.amount = validatedInput.amount;
    }
    if (validatedInput.status !== undefined) {
      updateData.status = validatedInput.status;
    }
    if (validatedInput.date !== undefined) {
      updateData.date = validatedInput.date;
    }

    const { data: payment, error } = await supabase
      .from("coach_payments")
      .update(updateData)
      .eq("id", validatedInput.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating coach payment:", error);
      return {
        success: false,
        message: `Failed to update payment: ${error.message}`,
      };
    }

    // Get coach_id to revalidate the correct page
    const { data: paymentData } = await supabase
      .from("coach_payments")
      .select("coach_id")
      .eq("id", validatedInput.id)
      .single();

    if (paymentData) {
      revalidatePath(`/dashboard/coaches/${paymentData.coach_id}`);
    }

    return {
      success: true,
      data: payment,
      message: "Payment updated successfully",
    };
  } catch (error) {
    console.error("Unexpected error in updateCoachPayment:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.message,
      };
    }
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Delete a coach payment by ID and revalidate the coach's dashboard page.
 *
 * @param paymentId - The UUID of the coach payment to delete.
 * @param coachId - The UUID of the coach whose dashboard should be revalidated after deletion.
 * @returns An object indicating success or failure. On success: `{ success: true, message: "Payment deleted successfully" }`. On failure: `{ success: false, message: string }`.
 */
export async function deleteCoachPayment(paymentId: string, coachId: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("coach_payments")
      .delete()
      .eq("id", paymentId);

    if (error) {
      console.error("Error deleting coach payment:", error);
      return {
        success: false,
        message: `Failed to delete payment: ${error.message}`,
      };
    }

    // Revalidate the coach details page
    revalidatePath(`/dashboard/coaches/${coachId}`);

    return {
      success: true,
      message: "Payment deleted successfully",
    };
  } catch (error) {
    console.error("Unexpected error in deleteCoachPayment:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Retrieve a single coach payment, including its client activity period and client info.
 *
 * Fetches the coach_payments row for the given payment ID and includes the related
 * client_activity_period (id, start_date, end_date, active) and that period's client (id, name).
 *
 * @param paymentId - The payment UUID to fetch
 * @returns The payment record with nested `client_activity_period` and `client` data, or `null` if not found or on error
 */
export async function getCoachPayment(paymentId: string) {
  try {
    const supabase = await createClient();

    const { data: payment, error } = await supabase
      .from("coach_payments")
      .select(
        `
        *,
        client_activity_period:client_activity_period!coach_payments_client_activity_period_id_client_activity_period (
          id,
          start_date,
          end_date,
          active,
          client:clients!client_activity_period_client_id_clients_id_fk (
            id,
            name
          )
        )
      `
      )
      .eq("id", paymentId)
      .single();

    if (error) {
      console.error("Error fetching coach payment:", error);
      return null;
    }

    return payment;
  } catch (error) {
    console.error("Unexpected error in getCoachPayment:", error);
    return null;
  }
}

/**
 * Retrieve and format client activity periods associated with a coach for use in selection controls.
 *
 * Attempts a direct query for activity periods that reference the given coach; if that fails it falls back
 * to resolving client IDs from client assignments and fetching activity periods for those clients.
 *
 * @param coachId - The coach's ID (UUID string) to fetch activity periods for.
 * @returns An array of formatted activity period objects:
 *  - id: activity period id
 *  - label: human-readable label like `"Client Name - MMM dd, yyyy to MMM dd, yyyy (Active)"`
 *  - clientName: client's name (or `"Unknown Client"`)
 *  - startDate: original start_date value (string) or null/undefined
 *  - endDate: original end_date value (string) or null/undefined
 *  - active: boolean indicating whether the period is active
 */
export async function getCoachClientActivityPeriods(coachId: string) {
  try {
    const supabase = await createClient();

    // Directly fetch activity periods that belong to this coach
    // The coach_id field exists on client_activity_period table
    const { data: activityPeriods, error } = await supabase
      .from("client_activity_period")
      .select(
        `
        id,
        start_date,
        end_date,
        active,
        client:clients!client_activity_period_client_id_clients_id_fk (
          id,
          name,
          email
        )
      `
      )
      .eq("coach_id", coachId as any) // Try with string first, as it might be UUID
      .order("start_date", { ascending: false });

    let finalActivityPeriods = activityPeriods || [];
    
    if (error) {
      console.error("Error fetching client activity periods:", error);

      // Fallback: If direct query fails, try through client assignments
      const { data: clientAssignments, error: assignmentsError } =
        await supabase
          .from("client_assignments")
          .select(
            `
          client_id
        `
          )
          .eq("coach_id", coachId as any);

      if (assignmentsError) {
        console.error("Error fetching client assignments:", assignmentsError);
        return [];
      }

      // Get unique client IDs
      const clientIds = [
        ...new Set(clientAssignments?.map((a) => a.client_id) || []),
      ];

      if (clientIds.length === 0) {
        return [];
      }

      // Get all activity periods for these clients
      const { data: fallbackPeriods, error: fallbackError } = await supabase
        .from("client_activity_period")
        .select(
          `
          id,
          start_date,
          end_date,
          active,
          client:clients!client_activity_period_client_id_clients_id_fk (
            id,
            name,
            email
          )
        `
        )
        .in("client_id", clientIds)
        .order("start_date", { ascending: false });

      if (fallbackError) {
        console.error(
          "Error fetching activity periods (fallback):",
          fallbackError
        );
        return [];
      }

      // Use fallback periods if main query failed
      finalActivityPeriods = fallbackPeriods || [];
    }
    const formattedPeriods =
      finalActivityPeriods?.map((period) => ({
        id: period.id,
        label: `${period.client?.name || "Unknown Client"} - ${
          period.start_date
            ? format(new Date(period.start_date), "MMM dd, yyyy")
            : "N/A"
        } to ${
          period.end_date
            ? format(new Date(period.end_date), "MMM dd, yyyy")
            : "Present"
        }${period.active ? " (Active)" : ""}`,
        clientName: period.client?.name || "Unknown Client",
        startDate: period.start_date,
        endDate: period.end_date,
        active: period.active,
      })) || [];

    console.log(
      `Found ${formattedPeriods.length} activity periods for coach ${coachId}`
    );

    return formattedPeriods;
  } catch (error) {
    console.error("Unexpected error in getCoachClientActivityPeriods:", error);
    return [];
  }
}
