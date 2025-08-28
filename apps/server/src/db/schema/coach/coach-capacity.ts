import { authUsers } from "@/db/shadow/auth";

import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { id, timestamps } from "../common";

export const coachCapacity = pgTable("coach_capacity", {
	id: id(),
	coach_id: text("coach_id").references(() => authUsers.id),
	max_total_clients: integer("max_total_clients").notNull(),
	max_client_units: integer("max_client_units").notNull(),
	...timestamps,
});
