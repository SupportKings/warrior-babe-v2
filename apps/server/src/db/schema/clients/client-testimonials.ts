import {
    pgTable,
    text,
    uuid,
    date,
} from "drizzle-orm/pg-core";
import { id, timestamps } from "../common";
import { clients } from "./clients";
import { authUsers } from "@/db/shadow/auth";

export const clientTestimonials = pgTable("client_testimonials", {
  id: id(),
  client_id: uuid("client_id").references(() => clients.id),
  testimonial_type: text("testimonial_type").notNull(),
  testimonial_url: text("testimonial_url"),
  content: text("content").notNull(),
  recorded_date: date("recorded_date").notNull(),
  recorded_by: text("recorded_by").references(() => authUsers.id),
  ...timestamps,
});
