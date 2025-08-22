import { uuid, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const id = () => uuid("id").primaryKey().defaultRandom();

export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
};

