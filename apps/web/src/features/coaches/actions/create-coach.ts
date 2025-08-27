"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schema for coach creation
const createCoachSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  onboarding_date: z.string().optional(),
  contract_type: z.string().optional(),
  roles: z.string().optional(),
  team_id: z.string().optional().nullable(),
});

export type CreateCoachInput = z.infer<typeof createCoachSchema>;

export async function createCoach(input: CreateCoachInput) {
  try {
    const supabase = await createClient();

    // Insert the new coach
    const { data: newCoach, error } = await supabase
      .from("team_members")
      .insert({
        name: input.name,
        email: input.email,
        onboarding_date: input.onboarding_date || null,
        contract_type: input.contract_type || null,
        roles: input.roles || null,
        team_id: input.team_id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating coach:", error);
      throw new Error(`Failed to create coach: ${error.message}`);
    }

    // Revalidate the coaches page
    revalidatePath("/dashboard/coaches");

    return {
      success: true,
      data: newCoach,
      message: `Coach ${input.name} has been successfully created`,
    };
  } catch (error) {
    console.error("Unexpected error in createCoach:", error);
    throw error;
  }
}
