import { pgTable, text, date } from "drizzle-orm/pg-core";
import { id, timestamps } from "../common";
import { authUsers } from "@/db/shadow/auth";

export const coachTeams = pgTable("coach_teams", {
  id: id(),
  premier_coach_id: text("premier_coach_id").references(() => authUsers.id),
  coach_id: text("coach_id").references(() => authUsers.id),
  start_date: date("start_date").notNull(),
  end_date: date("end_date"),
  ...timestamps,
});