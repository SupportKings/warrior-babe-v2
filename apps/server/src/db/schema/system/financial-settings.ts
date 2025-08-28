import { authUsers } from "@/db/shadow/auth";

import { date, pgTable, text } from "drizzle-orm/pg-core";
import { id, timestamps } from "../common";

export const financialSettings = pgTable("financial_settings", {
	id: id(),
	setting_name: text("setting_name").notNull(),
	setting_value: text("setting_value").notNull(),
	effective_date: date("effective_date").notNull(),
	created_by: text("created_by").references(() => authUsers.id),
	...timestamps,
});
