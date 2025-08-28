import { pgTable, text } from "drizzle-orm/pg-core";
import { id, timestamps } from "../common";

export const coachTeams = pgTable("coach_teams", {
	id: id(),
	premier_coach_id: text("premier_coach_id"), // References team_members.id but we can't import it due to circular dependency
	coach_id: text("coach_id"), // References team_members.id but we can't import it due to circular dependency
	...timestamps,
});
