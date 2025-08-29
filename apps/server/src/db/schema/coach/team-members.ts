import { authUsers } from "@/db/shadow/auth";

import { date, pgEnum, pgTable, text } from "drizzle-orm/pg-core";
import { id, timestamps } from "../common";

// Contract type enum matching database.types.ts
export const contractTypeEnum = pgEnum("contract_type_enum", ["W2", "Hourly"]);

export const teamMembers = pgTable("team_members", {
	id: id(),
	name: text("name"),
	user_id: text("user_id").references(() => authUsers.id),
	team_id: text("team_id"), // References coach_teams.id but we avoid circular dependency
	contract_type: contractTypeEnum("contract_type"),
	onboarding_date: date("onboarding_date"),
	createdAt: timestamps.createdAt,
});
