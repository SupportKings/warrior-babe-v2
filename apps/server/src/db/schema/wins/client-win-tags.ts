import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { id, timestamps } from "../common";
import { clientWins } from "./client-wins";
import { winTags } from "./win-tags";

export const clientWinTags = pgTable("client_win_tags", {
  id: id(),
  win_id: uuid("win_id").references(() => clientWins.id),
  tag_id: uuid("tag_id").references(() => winTags.id),
  ...timestamps,
});
