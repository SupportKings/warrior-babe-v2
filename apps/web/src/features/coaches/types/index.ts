import type { Database } from "@/utils/supabase/database.types";

// Base coach row type from database
export type CoachRow = Database["public"]["Tables"]["team_members"]["Row"] & {
	team_id: string | null;
	email?: string | null;
	team_name?: string | null;
	premier_coach_id?: string | null;
	user?: {
		id: string;
		email: string;
		role: string;
	} | null;
	team?: {
		id: string;
		premier_coach?: {
			id: string;
			name: string | null;
		} | null;
	} | null;
};

// Type for coach with team information
export type CoachWithTeam = CoachRow & {
	team_name?: string;
	team_id?: string;
};

// Coach filters type
export interface CoachFilters {
	name?: string;
	email?: string;
	contract_type?: string;
	team_id?: string;
}
