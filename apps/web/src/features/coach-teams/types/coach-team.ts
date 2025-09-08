import { z } from "zod";

export const coachTeamUpdateSchema = z.object({
	id: z.string().uuid(),
	teamName: z.string().min(1, "Team name is required").optional(),
	premierCoachId: z.string().uuid().nullable().optional(),
});

export type CoachTeamUpdateInput = z.infer<typeof coachTeamUpdateSchema>;
