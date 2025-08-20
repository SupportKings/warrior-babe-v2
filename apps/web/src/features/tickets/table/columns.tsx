import * as React from "react";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TimeDisplay } from "@/components/ui/time-display";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { priorities } from "@/icons/priority";
import { StatusIcon } from "@/icons/status";
import { UnassignedIcon } from "@/icons/unassigned";

import { createColumnHelper } from "@tanstack/react-table";
import { BellIcon } from "lucide-react";
import {
  getReminderDaysText,
  getReminderStatus,
} from "../utils/reminder-helpers";
import type { Ticket } from "./types";

const typeColors = {
  billing: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  tech_problem: "bg-red-100 text-red-800 hover:bg-red-100",
  escalation: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  coaching_transfer: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  retention: "bg-green-100 text-green-800 hover:bg-green-100",
  pausing: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  other: "bg-gray-100 text-gray-800 hover:bg-gray-100",
};

const typeLabels = {
  billing: "Billing",
  tech_problem: "Tech Problem",
  escalation: "Escalation",
  coaching_transfer: "Coaching Transfer",
  retention: "Retention",
  pausing: "Pausing",
  other: "Other",
};

const columnHelper = createColumnHelper<Ticket>();

export const ticketColumnDefs = [
  // Title - Primary identifier, most important
  columnHelper.accessor((row) => row.title, {
    id: "title",
    header: "Title",
    enableColumnFilter: true,
    meta: {
      className: "text-left min-w-[300px] flex-1",
      align: "left",
    },
    cell: ({ row }) => {
      const ticket = row.original;
      const reminderStatus = getReminderStatus(ticket);
      const reminderText = getReminderDaysText(ticket);
      
      // Format reminder date for tooltip (date only, no time)
      const formatReminderDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      };

      return (
        <div className="flex items-center gap-2">
          <div>
            <div className="font-medium">{ticket.title}</div>
          </div>
          {reminderStatus !== "no-reminder" && ticket.reminder_date && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs cursor-default",
                      reminderStatus === "overdue" && "text-red-600",
                      reminderStatus === "due-today" && "text-orange-600",
                      reminderStatus === "upcoming" && "text-muted-foreground"
                    )}
                  >
                    <BellIcon className="h-3 w-3" />
                    {(reminderStatus === "overdue" || reminderStatus === "due-today") && (
                      <span className="font-medium">{reminderText}</span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">Reminder set for:</p>
                  <p>{formatReminderDate(ticket.reminder_date)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );
    },
  }),
  // Priority - How urgent
  columnHelper.accessor((row) => row.priority, {
    id: "priority",
    header: "Priority",
    enableColumnFilter: true,
    meta: {
      className: "min-w-[100px] w-[120px]",
      align: "left",
    },
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string;
      const priorityConfig = priorities.find(
        (p) => p.id === priority || p.name.toLowerCase() === priority
      );

      if (priorityConfig) {
        const IconComponent = priorityConfig.icon as React.ComponentType<{
          className?: string;
          style?: React.CSSProperties;
        }>;
        return (
          <div className="flex items-center gap-2">
            <IconComponent className="h-4 w-4" />
            <span className="font-medium text-sm">{priorityConfig.name}</span>
          </div>
        );
      }

      return (
        <span className="font-medium text-sm">
          {priority
            ? priority.charAt(0).toUpperCase() + priority.slice(1)
            : "Unknown"}
        </span>
      );
    },
  }),
  // Status - Current state
  columnHelper.accessor((row) => row.status, {
    id: "status",
    header: "Status",
    enableColumnFilter: true,
    meta: {
      className: "min-w-[100px] w-[120px]",
      align: "left",
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusMap = {
        open: { label: "Open", color: "text-green-700" },
        in_progress: { label: "In Progress", color: "text-yellow-700" },
        resolved: { label: "Resolved", color: "text-blue-700" },
        closed: { label: "Closed", color: "text-gray-700" },
        paused: { label: "Paused", color: "text-purple-700" },
      };

      const statusConfig = statusMap[status as keyof typeof statusMap] || {
        label: status
          ?.replace("_", " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        color: "text-gray-700",
      };

      return (
        <div className="flex items-center gap-2">
          {React.createElement(
            StatusIcon as React.ComponentType<{ statusId: string }>,
            { statusId: status }
          )}
          <span className="font-medium text-sm">{statusConfig.label}</span>
        </div>
      );
    },
  }),
  // Type - What kind of ticket
  columnHelper.accessor((row) => row.ticket_type, {
    id: "type",
    header: "Type",
    enableColumnFilter: true,
    meta: {
      className: "min-w-[100px] w-[120px] border-l-0",
      align: "left",
    },
    cell: ({ row }) => {
      const type = row.getValue("type") as keyof typeof typeLabels;
      return (
        <Badge
          variant="secondary"
          className={cn("border-0", typeColors[type] || typeColors.other)}
        >
          {typeLabels[type] || type}
        </Badge>
      );
    },
  }),
  // Assigned To - Who's handling it
  columnHelper.accessor((row) => row.assigned_to_user?.id, {
    id: "assignee",
    header: "Assignee",
    enableColumnFilter: true,
    meta: {
      className: "min-w-[120px] w-[140px]",
      align: "left",
    },
    cell: ({ row }) => {
      const user = row.original.assigned_to_user;

      if (!user) {
        return <UnassignedIcon className="size-6 text-gray-400" />;
      }

      const initials =
        user.name
          ?.split(" ")
          .map((x) => x[0])
          .join("")
          .toUpperCase() || "??";

      return (
        <Avatar className="size-6">
          <AvatarImage src={user.image || ""} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      );
    },
  }),
  // Client - Who the ticket is about
  columnHelper.accessor((row) => row.client?.id, {
    id: "client",
    header: "Client",
    enableColumnFilter: true,
    meta: {
      className: "min-w-[140px] w-[160px]",
      align: "left",
    },
    cell: ({ row }) => {
      const client = row.original.client;

      if (!client) {
        return <span className="text-gray-400 text-sm">No client</span>;
      }

      const fullName = `${client.first_name || ""} ${
        client.last_name || ""
      }`.trim();
      const initials =
        `${client.first_name?.[0] || ""}${
          client.last_name?.[0] || ""
        }`.toUpperCase() || "??";

      return (
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span
            className="max-w-[120px] truncate font-medium text-sm"
            title={fullName}
          >
            {fullName || "Unknown"}
          </span>
        </div>
      );
    },
  }),
  // Created - When it was submitted
  columnHelper.accessor((row) => row.created_at, {
    id: "created",
    header: "Created",
    enableColumnFilter: true,
    meta: {
      className: "min-w-[100px] w-[120px]",
      align: "left",
    },
    cell: ({ row }) => {
      const createdAt = row.getValue("created") as string;
      if (!createdAt) return null;

      return (
        <TimeDisplay
          timestamp={createdAt}
          className="text-muted-foreground text-sm"
          showTooltip={false}
        />
      );
    },
  }),
];
