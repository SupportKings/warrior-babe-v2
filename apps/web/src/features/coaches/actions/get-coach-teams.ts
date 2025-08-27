"use server";

import { createClient } from "@/utils/supabase/server";

export interface PremierCoach {
  id: string; // This will be the coach_teams ID
  premier_coach_id: string; // The team_members ID of the premier coach
  name: string;
  email: string | null;
}

export async function getAllPotentialTeamLeaders(): Promise<PremierCoach[]> {
  try {
    const supabase = await createClient();

    // Get all coach teams with their premier coach details
    const { data: coachTeams, error } = await supabase
      .from("coach_teams")
      .select(
        `
        id,
        premier_coach_id,
        premier_coach:team_members!coach_teams_premier_coach_id_fkey (
          id,
          name,
          user:user!team_members_user_id_fkey (
            email
          )
        )
      `
      )
      .not("premier_coach_id", "is", null);

    if (error) {
      console.error("Error fetching team leaders:", error);
      return [];
    }

    // Create a map to store unique premier coaches by their team ID
    const uniqueTeamsMap = new Map<string, PremierCoach>();

    coachTeams?.forEach((team: any) => {
      if (team.premier_coach && team.id) {
        // Use the coach_teams ID as the key and value ID
        uniqueTeamsMap.set(team.id, {
          id: team.id, // coach_teams ID - this is what we'll store in team_members.team_id
          premier_coach_id: team.premier_coach_id, // team_members ID of the premier coach
          name: team.premier_coach.name || "Unknown",
          email: team.premier_coach.user?.email || null,
        });
      }
    });

    // Convert map to array and sort by name
    return Array.from(uniqueTeamsMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );
  } catch (error) {
    console.error("Unexpected error in getAllPotentialTeamLeaders:", error);
    return [];
  }
}
