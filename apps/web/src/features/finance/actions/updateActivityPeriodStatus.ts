"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { actionClient } from "@/lib/safe-action";

const updateActivityPeriodStatusSchema = z.object({
  id: z.string().uuid(),
  active: z.boolean(),
});

export const updateActivityPeriodStatusAction = actionClient
  .inputSchema(updateActivityPeriodStatusSchema)
  .action(async ({ parsedInput }) => {
    const { id, active } = parsedInput;
    const supabase = await createClient();

    // Update the activity period status
    const { data, error } = await supabase
      .from("client_activity_period")
      .update({ active })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating activity period status:", error);
      throw new Error("Failed to update activity period status");
    }

    return {
      success: true,
      data,
    };
  });