"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

// Validation schema for coach creation
const createCoachSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address"),
	onboarding_date: z.string().optional(),
	contract_type: z.string().optional(),
	roles: z.string().optional(),
	team_id: z.string().optional().nullable(),
});

export type CreateCoachInput = z.infer<typeof createCoachSchema>;

export async function createCoach(input: CreateCoachInput) {
	try {
		const supabase = await createClient();

		// Start a transaction-like operation
		// First, check if user with this email already exists
		const { data: existingUser, error: checkError } = await supabase
			.from("user")
			.select("id, email")
			.eq("email", input.email)
			.single();

		if (checkError && checkError.code !== "PGRST116") {
			// PGRST116 means no rows found
			console.error("Error checking existing user:", checkError);
			throw new Error(`Failed to check existing user: ${checkError.message}`);
		}

		let userId: string;

		if (existingUser) {
			// User already exists, use their ID
			userId = existingUser.id;
			console.log("Using existing user with ID:", userId);
		} else {
			// Create new user in the user table
			const { data: newUser, error: userError } = await supabase
				.from("user")
				.insert({
					id: crypto.randomUUID(), // Generate a UUID for the user
					email: input.email,
					name: input.name,
					role: input.roles || null, // Store the roles in the user table
					emailVerified: false,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				})
				.select()
				.single();

			if (userError) {
				console.error("Error creating user:", userError);
				throw new Error(`Failed to create user: ${userError.message}`);
			}

			userId = newUser.id;
			console.log("Created new user with ID:", userId);
		}

		// Now create the team_member record linked to the user
		const { data: newTeamMember, error: teamMemberError } = await supabase
			.from("team_members")
			.insert({
				user_id: userId, // Link to the user we just created or found
				name: input.name,
				team_id: input.team_id ?? null,
				contract_type:
					input.contract_type === "W2" || input.contract_type === "Hourly"
						? input.contract_type
						: null,
				onboarding_date: input.onboarding_date ?? null,
				created_at: new Date().toISOString(),
			})
			.select(`
        *,
        user:user!team_members_user_id_fkey (
          id,
          email,
          name,
          role
        ),
        team:coach_teams!team_members_team_id_fkey (
          id,
          premier_coach:team_members!coach_teams_premier_coach_id_fkey (
            id,
            name
          )
        )
      `)
			.single();

		if (teamMemberError) {
			console.error("Error creating team member:", teamMemberError);

			// If team member creation fails but user was created, we should note this
			if (!existingUser) {
				console.error(
					"Warning: User was created but team member creation failed. User ID:",
					userId,
				);
				// In a production environment, you might want to delete the orphaned user
				// or have a cleanup process
			}

			throw new Error(
				`Failed to create team member: ${teamMemberError.message}`,
			);
		}

		// Revalidate the coaches page
		revalidatePath("/dashboard/coaches");

		return {
			success: true,
			data: newTeamMember,
			message: `Team member ${input.name} has been successfully created`,
		};
	} catch (error) {
		console.error("Unexpected error in createCoach:", error);

		// Return error response instead of throwing
		return {
			success: false,
			message:
				error instanceof Error ? error.message : "An unexpected error occurred",
		};
	}
}
