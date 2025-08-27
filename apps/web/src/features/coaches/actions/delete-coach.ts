"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteCoach({ id }: { id: string | any }) {
  try {
    const supabase = await createClient();

    // Check if coach exists
    const { data, error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", id);

    if (error || !data) {
      throw new Error("Coach not found");
    }

    revalidatePath("/dashboard/coaches");

    return {
      success: true,
      message: `Coach has been successfully deleted`,
    };
  } catch (error) {
    console.error("Unexpected error in deleteCoach:", error);
    throw error;
  }
}
