import {
	boolean,
	date,
	integer,
	pgEnum,
	pgTable,
	text,
	uuid,
} from "drizzle-orm/pg-core";
import { id, timestamps } from "../common";

export const products = pgTable("products", {
	id: id(),
	name: text("name").notNull(),
	description: text("description"),
	default_duration_months: integer("default_duration_months").default(0),
	is_active: boolean("is_active").notNull().default(true),
	client_unit: integer("client_unit").default(0),
	...timestamps,
});
