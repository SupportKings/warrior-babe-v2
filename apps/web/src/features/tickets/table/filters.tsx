import { createColumnConfigHelper } from "@/components/data-table-filter/core/filters";

import {
  BellIcon,
  CircleDotDashedIcon,
  Heading1Icon,
  TagIcon,
  TrendingUpIcon,
  UserCheckIcon,
  UserIcon,
} from "lucide-react";
import type { Ticket } from "./types";

const dtf = createColumnConfigHelper<Ticket>();

export const columnsConfig = [
  dtf
    .text()
    .id("title")
    .accessor((row) => row.title)
    .displayName("Title")
    .icon(Heading1Icon)
    .build(),
  dtf
    .option()
    .accessor((row) => row.status)
    .id("status")
    .displayName("Status")
    .icon(CircleDotDashedIcon)
    .build(),
  dtf
    .option()
    .accessor((row) => row.priority)
    .id("priority")
    .displayName("Priority")
    .icon(TrendingUpIcon)
    .build(),
  dtf
    .option()
    .accessor((row) => row.ticket_type)
    .id("type")
    .displayName("Type")
    .icon(TagIcon)
    .build(),
  dtf
    .option()
    .accessor((row) => row.assigned_to_user?.id)
    .id("assignee")
    .displayName("Assignee")
    .icon(UserCheckIcon)
    .build(),
  dtf
    .option()
    .accessor((row) => row.client?.id)
    .id("client")
    .displayName("Client")
    .icon(UserIcon)
    .build(),
  dtf
    .option()
    .accessor((row) => {
      // Map reminder dates to status categories
      if (!row.reminder_date) return "no-reminder";
      
      const reminderDate = new Date(row.reminder_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      reminderDate.setHours(0, 0, 0, 0);
      
      // Check if ticket is resolved/closed
      if (row.status === "resolved" || row.status === "closed") {
        return "no-reminder";
      }
      
      if (reminderDate < today) return "overdue";
      if (reminderDate.getTime() === today.getTime()) return "due-today";
      return "upcoming";
    })
    .id("reminder")
    .displayName("Reminder")
    .icon(BellIcon)
    .build(),
] as const;
