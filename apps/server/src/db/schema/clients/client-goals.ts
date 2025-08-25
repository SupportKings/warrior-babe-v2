import { pgTable, text, uuid, pgEnum, date } from "drizzle-orm/pg-core";
import { id, timestamps } from "../common";
import { clients } from "./clients";
import { goalTypes } from "../goals/goal-types";
import { authUsers } from "@/db/shadow/auth";

export const goalStatus = pgEnum("status", [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
  "overdue",
]);
export const goalPriority = pgEnum("priority", ["high", "medium", "low"]);

export const clientGoals = pgTable("client_goals", {
  id: id(),
  client_id: uuid("client_id").references(() => clients.id),
  goal_type_id: uuid("goal_type_id").references(() => goalTypes.id),
  title: text("title").notNull(),
  description: text("description"),
  notes: text("notes"),
  target_value: text("target_value").notNull(),
  current_value: text("current_value").notNull(),
  status: goalStatus("status").notNull().default("pending"),
  priority: goalPriority("priority").notNull().default("medium"),
  started_at: date("started_at").notNull(),
  due_date: date("due_date").notNull(),
  completed_at: date("completed_at"),
  created_by: text("created_by").references(() => authUsers.id),
  updated_by: text("updated_by").references(() => authUsers.id),
  ...timestamps,
});
