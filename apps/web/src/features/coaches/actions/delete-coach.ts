"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteCoach(coachId: string) {
	try {
		const supabase = await createClient();
		
		// First, get the team member to find the user_id
		const { data: teamMember, error: fetchError } = await supabase
			.from("team_members")
			.select("user_id, name")
			.eq("id", coachId)
			.single();

		if (fetchError || !teamMember) {
			console.error("Error fetching team member:", fetchError);
			throw new Error(`Team member not found: ${fetchError?.message || "Unknown error"}`);
		}

		const userId = teamMember.user_id;
		const coachName = teamMember.name;

		// Delete the team_member record first (due to foreign key constraint)
		const { error: teamMemberDeleteError } = await supabase
			.from("team_members")
			.delete()
			.eq("id", coachId);

		if (teamMemberDeleteError) {
			console.error("Error deleting team member:", teamMemberDeleteError);
			throw new Error(`Failed to delete team member: ${teamMemberDeleteError.message}`);
		}

		// If there's a user_id, check if this user is referenced elsewhere before deleting
		if (userId) {
			// Check if this user is still referenced by other team_members
			const { data: otherTeamMembers, error: checkError } = await supabase
				.from("team_members")
				.select("id")
				.eq("user_id", userId)
				.limit(1);

			if (checkError) {
				console.error("Error checking other team members:", checkError);
				// Not critical, continue without deleting user
			} else if (!otherTeamMembers || otherTeamMembers.length === 0) {
				// No other team_members reference this user, safe to delete
				const { error: userDeleteError } = await supabase
					.from("user")
					.delete()
					.eq("id", userId);

				if (userDeleteError) {
					console.error("Error deleting user:", userDeleteError);
					// Not critical if user deletion fails, team member is already deleted
				}
			} else {
				console.log("User is still referenced by other team members, keeping user record");
			}
		}

		// Revalidate the coaches pages
		revalidatePath("/dashboard/coaches");
		revalidatePath(`/dashboard/coaches/${coachId}`);

		return {
			success: true,
			message: `Team member ${coachName} has been successfully deleted`,
		};
	} catch (error) {
		console.error("Unexpected error in deleteCoach:", error);
		
		return {
			success: false,
			message: error instanceof Error ? error.message : "An unexpected error occurred",
		};
	}
}
