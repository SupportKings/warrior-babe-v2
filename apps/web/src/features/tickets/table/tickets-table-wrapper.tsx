"use client";

import type { FiltersState } from "@/components/data-table-filter/core/types";

import { parseAsJson, useQueryState } from "nuqs";
import { z } from "zod";
import { TicketsTable } from "./tickets-table";

const filtersSchema = z.custom<FiltersState>();

export function TicketsTableWrapper({ 
  assignedToUserId,
  excludeAdminTickets,
  userRole
}: { 
  assignedToUserId?: string;
  excludeAdminTickets?: boolean;
  userRole?: string;
}) {
  const [filters, setFilters] = useQueryState<FiltersState>(
    "filters",
    parseAsJson(filtersSchema.parse).withDefault([])
  );

  return (
    <TicketsTable 
      assignedToUserId={assignedToUserId}
      excludeAdminTickets={excludeAdminTickets}
      userRole={userRole}
      state={{ filters, setFilters }} 
    />
  );
}