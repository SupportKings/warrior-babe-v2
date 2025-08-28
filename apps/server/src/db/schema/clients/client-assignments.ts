import { authUsers } from "@/db/shadow/auth";

import { date, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { id, timestamps } from "../common";
import { clients } from "./clients";

export const clientAssignments = pgTable("client_assignments", {
	id: id(),
	clientId: uuid("client_id")
		.notNull()
		.references(() => clients.id),
	userId: text("user_id").references(() => authUsers.id),
	assignmentType: text("assignment_type").notNull(),
	startDate: date("start_date").notNull(),
	endDate: date("end_date"),
	assignedBy: text("assigned_by").references(() => authUsers.id),
	...timestamps,
});
