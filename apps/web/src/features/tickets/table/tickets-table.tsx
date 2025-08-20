"use client";

import { useState } from "react";

import {
  DataTableFilter,
  useDataTableFilters,
} from "@/components/data-table-filter";
import type { FiltersState } from "@/components/data-table-filter/core/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { priorities } from "@/icons/priority";
import { status } from "@/icons/status";

import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { BellIcon, BellOffIcon } from "lucide-react";
import { useTickets } from "../queries/useTickets";
import { ticketColumnDefs } from "./columns";
import { DataTable } from "./data-table";
import { columnsConfig } from "./filters";
import { TableFilterSkeleton, TableSkeleton } from "./table-skeleton";
import {
  type Ticket,
  ticketPriorities,
  ticketStatuses,
  ticketTypes,
} from "./types";

function createStatusOptions() {
  return ticketStatuses.map((s) => {
    const statusConfig = status.find((statusItem) => statusItem.id === s.id);
    return {
      value: s.id,
      label: s.name,
      icon: statusConfig ? (
        <statusConfig.icon className="size-4" style={{ color: s.color }} />
      ) : undefined,
    };
  });
}

function createPriorityOptions() {
  return ticketPriorities.map((p) => {
    const priorityConfig = priorities.find(
      (priorityItem) => priorityItem.id === p.id
    );
    return {
      value: p.id,
      label: p.name,
      icon: priorityConfig ? (
        <priorityConfig.icon className="size-4" />
      ) : undefined,
    };
  });
}

function createTypeOptions() {
  return ticketTypes.map((t) => ({
    value: t.id,
    label: t.name,
  }));
}

function createUserOptions(tickets: Ticket[] | undefined) {
  if (!tickets) return [];

  const users = new Map();
  tickets.forEach((ticket) => {
    if (ticket.assigned_to_user) {
      const user = ticket.assigned_to_user;
      if (!users.has(user.id)) {
        users.set(user.id, user);
      }
    }
  });

  return Array.from(users.values()).map((u: any) => ({
    value: u.id,
    label: u.name,
    icon: (
      <Avatar key={u.id} className="size-4">
        <AvatarImage src={u.image || ""} />
        <AvatarFallback className="text-xs">
          {u.name
            ?.split(" ")
            .map((x: string) => x[0])
            .join("")
            .toUpperCase() || "??"}
        </AvatarFallback>
      </Avatar>
    ),
  }));
}

function createClientOptions(tickets: Ticket[] | undefined) {
  if (!tickets) return [];

  const clients = new Map();
  tickets.forEach((ticket) => {
    if (ticket.client) {
      const client = ticket.client;
      if (!clients.has(client.id)) {
        clients.set(client.id, client);
      }
    }
  });

  return Array.from(clients.values()).map((c: any) => {
    const fullName = `${c.first_name || ""} ${c.last_name || ""}`.trim();
    const initials = `${c.first_name?.[0] || ""}${c.last_name?.[0] || ""}`.toUpperCase() || "??";
    
    return {
      value: c.id,
      label: fullName || "Unknown",
      icon: (
        <Avatar key={c.id} className="size-4">
          <AvatarFallback className="text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
      ),
    };
  });
}

function createReminderOptions() {
  return [
    {
      value: "overdue",
      label: "Overdue",
      icon: <BellIcon className="size-4 text-red-600" />,
    },
    {
      value: "due-today",
      label: "Due Today",
      icon: <BellIcon className="size-4 text-orange-600" />,
    },
    {
      value: "upcoming",
      label: "Upcoming",
      icon: <BellIcon className="size-4 text-muted-foreground" />,
    },
    {
      value: "no-reminder",
      label: "No Reminder",
      icon: <BellOffIcon className="size-4 text-muted-foreground" />,
    },
  ];
}

export function TicketsTable({
  assignedToUserId,
  excludeAdminTickets,
  userRole,
  state,
}: {
  assignedToUserId?: string;
  excludeAdminTickets?: boolean;
  userRole?: string;
  state: {
    filters: FiltersState;
    setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  };
}) {
  /* Step 1: Fetch data from the server */
  const {
    data: tickets,
    isLoading,
    error,
  } = useTickets(assignedToUserId, state.filters, excludeAdminTickets, true, userRole);

  /* Step 2: Create ColumnOption[] for each option-based column */
  const statusOptions = createStatusOptions();
  const priorityOptions = createPriorityOptions();
  const typeOptions = createTypeOptions();
  const userOptions = createUserOptions(tickets);
  const clientOptions = createClientOptions(tickets);
  const reminderOptions = createReminderOptions();

  /*
   * Step 3: Create our data table filters instance
   */
  const { columns, filters, actions, strategy } = useDataTableFilters({
    strategy: "server",
    data: tickets ?? [],
    columnsConfig,
    filters: state.filters,
    onFiltersChange: state.setFilters,
    options: {
      status: statusOptions,
      priority: priorityOptions,
      type: typeOptions,
      assignee: userOptions,
      client: clientOptions,
      reminder: reminderOptions,
    },
  });

  /* Step 4: Create our TanStack Table instance */
  const [rowSelection, setRowSelection] = useState({});
  const table = useReactTable({
    data: tickets ?? [],
    columns: ticketColumnDefs,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  });

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-600">Failed to load tickets</p>
      </div>
    );
  }

  /* Step 5: Render the table! */
  return (
    <div className="col-span-2 w-full">
      <div className="sticky top-0 z-10 flex h-[40px] items-center border-border border-b px-6">
        {isLoading ? (
          <TableFilterSkeleton />
        ) : (
          <DataTableFilter
            filters={filters}
            columns={columns}
            actions={actions}
            strategy={strategy}
          />
        )}
      </div>
      {isLoading ? (
        <div className="col-span-2 w-full">
          <TableSkeleton numCols={ticketColumnDefs.length} numRows={10} />
        </div>
      ) : (
        <DataTable table={table} actions={actions} filters={state.filters} />
      )}
    </div>
  );
}
