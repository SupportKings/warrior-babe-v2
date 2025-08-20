"use client";

import type { AnyRoleStatements } from "@/lib/permissions";

import type { FiltersState } from "@/components/data-table-filter/core/types";

import { CapacityTable } from "./table";
import CapacityOverview from "./capacity-overview";

import { parseAsJson, useQueryState } from "nuqs";
import { z } from "zod";

const filtersSchema = z.custom<FiltersState>();

interface CapacityClientProps {
  permissions: AnyRoleStatements;
  userId: string;
  userRole: string;
}

export default function CapacityClient({
  permissions,
  userId,
  userRole,
}: CapacityClientProps) {
  // Manage filters state with URL persistence
  const [filters, setFilters] = useQueryState<FiltersState>(
    "filters",
    parseAsJson(filtersSchema.parse).withDefault([])
  );

  return (
    <div className="space-y-6">
      {/* Enhanced KPI Cards */}
      <CapacityOverview 
        userId={userId}
        userRole={userRole}
      />
      
      {/* Enhanced Capacity Table */}
      <div>
        <h2 className="mb-4 font-semibold text-lg">
          Coach Capacity Details
        </h2>
        <CapacityTable
          state={{ filters, setFilters }}
          userId={userId}
          userRole={userRole}
        />
      </div>
    </div>
  );
}