"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schema for coach update
const updateCoachSchema = z.object({
	id: z.string(),
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address"),
	onboarding_date: z.string().optional(),
	contract_type: z.string().optional(),
	roles: z.string().optional(),
	team_id: z.string().optional().nullable(),
});

export type UpdateCoachInput = z.infer<typeof updateCoachSchema>;

export async function updateCoach(input: UpdateCoachInput) {
	try {
		const supabase = await createClient();

		// Update the coach
		const { data: updatedCoach, error } = await supabase
			.from("team_members")
			.update({
				name: input.name,
				email: input.email,
				onboarding_date: input.onboarding_date || null,
				contract_type: input.contract_type || null,
				roles: input.roles || null,
				team_id: input.team_id || null,
			})
			.eq("id", input.id as any)
			.select()
			.single();

		if (error) {
			console.error("Error updating coach:", error);
			throw new Error(`Failed to update coach: ${error.message}`);
		}

		// Revalidate the coaches pages
		revalidatePath("/dashboard/coaches");
		revalidatePath(`/dashboard/coaches/${input.id}`);
		revalidatePath(`/dashboard/coaches/${input.id}/edit`);

		return {
			success: true,
			data: updatedCoach,
			message: `Coach ${input.name} has been successfully updated`,
		};
	} catch (error) {
		console.error("Unexpected error in updateCoach:", error);
		throw error;
	}
}