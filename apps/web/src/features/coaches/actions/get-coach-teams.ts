"use server";

import { createClient } from "@/utils/supabase/server";

export interface PremierCoach {
  id: string;
  name: string;
  email: string;
}
export async function getAllPotentialTeamLeaders(): Promise<PremierCoach[]> {
  try {
    const supabase = await createClient();

    const { data: premierCoaches, error } = await supabase
      .from("coach_teams")
      .select(
        `
			coach:team_members!coach_teams_premier_coach_id_fkey (
				id,
				name,
				email
			)
    	`
      )
      .not("premier_coach_id", "is", null);

    if (error) {
      console.error("Error fetching team members:", error);
      return [];
    }

    return (
      premierCoaches?.map((member: any) => ({
        id: member.coach.id,
        name: member.coach.name || "Unknown",
        email: member.coach.email || "",
      })) || []
    );
  } catch (error) {
    console.error("Unexpected error in getAllPotentialTeamLeaders:", error);
    return [];
  }
}
