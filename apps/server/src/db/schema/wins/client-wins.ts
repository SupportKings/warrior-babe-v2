import { authUsers } from "@/db/shadow/auth";

import { date, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { clients } from "../clients/clients";
import { id, timestamps } from "../common";

export const clientWins = pgTable("client_wins", {
	id: id(),
	client_id: uuid("client_id").references(() => clients.id),
	title: text("title").notNull(),
	description: text("description"),
	win_date: date("win_date").notNull(),
	recorded_by: text("recorded_by").references(() => authUsers.id),
	//   win_tags
	...timestamps,
});
