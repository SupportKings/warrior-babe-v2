"use client";

import {
  DataTableFilter,
  useDataTableFilters,
} from "@/components/data-table-filter";
import type { FiltersState } from "@/components/data-table-filter/core/types";

import { useQuery } from "@tanstack/react-query";
import { Award, BookOpen, ShieldCheck } from "lucide-react";
import { coachQueries } from "../../queries/coaches";
import { getCoachColumns } from "./columns";
import { CoachesDataTable } from "./data-table";
import { coachColumnsConfig } from "./filters";
import { TableFilterSkeleton, TableSkeleton } from "./table-skeleton";

// Create option transformers
function createTypeOptions(types: Map<string, number> | undefined) {
  if (!types) return [];

  return Array.from(types.entries()).map(([type, count]) => ({
    value: type,
    label: type,
    count,
    icon: type === "Premier" ? <ShieldCheck className="h-3 w-3" /> : undefined,
  }));
}

function createSpecializationOptions(specializations: Map<string, number> | undefined) {
  if (!specializations) return [];

  return Array.from(specializations.entries()).map(([specialization, count]) => ({
    value: specialization,
    label: specialization,
    count,
    // Note: The icon from the database isn't available in the faceted query yet
    // This would require updating the faceted query to include icon data
    icon: <BookOpen className="h-3 w-3" />,
  }));
}

function createCertificationOptions(certifications: Map<string, number> | undefined) {
  if (!certifications) return [];

  return Array.from(certifications.entries()).map(([certification, count]) => ({
    value: certification,
    label: certification,
    count,
    icon: <Award className="h-3 w-3" />,
  }));
}

export function CoachesTable({
  state,
  userId,
  userRole,
}: {
  state: {
    filters: FiltersState;
    setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  };
  userId?: string;
  userRole?: string;
}) {
  // Set up team filter for premier coaches
  const teamFilter = userRole === "premiereCoach" && userId
    ? { premiereCoachId: userId }
    : undefined;

  // Fetch data from the server with unified query
  const coaches = useQuery(coachQueries.allCoaches(state.filters, teamFilter));

  // Fetch faceted data for filters
  const facetedTypes = useQuery(coachQueries.faceted.types());
  const facetedSpecializations = useQuery(coachQueries.faceted.specializations());
  const facetedCertifications = useQuery(coachQueries.faceted.certifications());
  const facetedClientCounts = useQuery(coachQueries.faceted.clientCounts());

  // Create options for filters
  const typeOptions = createTypeOptions(facetedTypes.data);
  const specializationOptions = createSpecializationOptions(facetedSpecializations.data);
  const certificationOptions = createCertificationOptions(facetedCertifications.data);

  const isOptionsDataPending =
    facetedTypes.isPending ||
    facetedSpecializations.isPending ||
    facetedCertifications.isPending ||
    facetedClientCounts.isPending;

  // Create data table filters instance
  const { columns, filters, actions, strategy } = useDataTableFilters({
    strategy: "server",
    data: coaches.data ?? [],
    columnsConfig: coachColumnsConfig,
    filters: state.filters,
    onFiltersChange: state.setFilters,
    options: {
      type: typeOptions,
      specialization: specializationOptions,
      certifications: certificationOptions,
    },
    faceted: {
      type: facetedTypes.data,
      specialization: facetedSpecializations.data,
      certifications: facetedCertifications.data,
      activeClients: facetedClientCounts.data,
    },
  });

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
        {isOptionsDataPending ? (
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
      {coaches.isLoading ? (
        <TableSkeleton
          numCols={getCoachColumns(userRole).length}
          numRows={10}
        />
      ) : (
        <CoachesDataTable
          data={coaches.data || []}
          hideColumns={userRole === "premiereCoach" ? ["premierCoach"] : []}
          userRole={userRole}
        />
      )}
    </div>
  );
}
