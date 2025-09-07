"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

export async function unlinkTeamMember(teamMemberId: string) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  // Unlink the team member by setting team_id to null
  const { error } = await supabase
    .from("team_members")
    .update({ team_id: null })
    .eq("id", teamMemberId);

  if (error) {
    throw new Error(`Failed to unlink team member: ${error.message}`);
  }

  return { success: true };
}

// Keep the old function name for backward compatibility, but have it call the new one
export async function deleteTeamMember(teamMemberId: string) {
  return unlinkTeamMember(teamMemberId);
}

export async function createTeamMember(teamId: string, teamMemberData: any) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  const { role, user_id, team_member_id, ...rest } = teamMemberData;

  // Update the existing team_members record to link the member to the team
  const { data, error } = await supabase
    .from("team_members")
    .update({
      team_id: teamId,
      ...rest
    })
    .eq("id", team_member_id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to link team member to team: ${error.message}`);
  }

  // Update the user's roles in the user table
  if (role && user_id) {
    const { error: user_error } = await supabase
      .from("user")
      .update({ role: role })
      .eq("id", user_id);

    if (user_error) {
      throw new Error(`Failed to update user roles: ${user_error.message}`);
    }
  }

  return { success: true, data };
}

export async function updateTeamMember(
  teamMemberId: string,
  teamMemberData: any
) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Authentication required");
  }
  const { role, user_id, ...rest } = teamMemberData;
  const { error } = await supabase
    .from("team_members")
    .update(rest)
    .eq("id", teamMemberId);
  if (error) {
    throw new Error(`Failed to update team member: ${error.message}`);
  }

  const { error: user_error } = await supabase
    .from("user")
    .update({ role: role })
    .eq("id", user_id);

  if (user_error) {
    throw new Error(`Failed to update team member: ${user_error.message}`);
  }

  return { success: true };
}
