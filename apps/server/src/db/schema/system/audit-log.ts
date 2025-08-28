import {
	date,
	integer,
	pgEnum,
	pgTable,
	text,
	uuid,
} from "drizzle-orm/pg-core";
import { id, timestamps } from "../common";

export const auditLog = pgTable("audit_log", {
	id: id(),
	...timestamps,
});
