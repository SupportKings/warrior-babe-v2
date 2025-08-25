import {
  pgTable,
  text,
  integer,
  uuid,
  pgEnum,
  date,
} from "drizzle-orm/pg-core";
import { id, timestamps } from "../common";
import { paymentSlots } from "./payment-slots";

export const disputedStatusEnum = pgEnum("disputed_status", [
  "Not Disputed",
  "Disputed",
  "Evidence Submtited",
  "Dispute Won",
  "Dispute Lost",
]);

export const payments = pgTable("payments", {
  id: id(),
  amount: integer("amount").default(0),
  payment_date: date("payment_date"),
  payment_method: text("payment_method"),
  stripe_transaction_id: text("stripe_transaction_id"),
  status: text("status"),
  platform: text("platform"),
  declined_at: date("declined_at"),
  disputed_status: disputedStatusEnum("disputed_status"),
  dispute_fee: integer("dispute_fee").default(0),
  ...timestamps,
});
