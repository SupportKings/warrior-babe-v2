import { authUsers } from "@/db/shadow/auth";

import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { clientActivityPeriods } from "../clients/client-activity-periods";
import { id, timestamps } from "../common";

export const coachPayments = pgTable("coach_payments", {
	id: id(),
	coachId: text("coach_id").references(() => authUsers.id),
	amount: integer("amount").notNull(),
	client_activity_period_id: uuid("client_activity_period_id").references(
		() => clientActivityPeriods.id,
	),
	...timestamps,
});
