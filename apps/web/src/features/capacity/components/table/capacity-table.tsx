"use client";

import {
  DataTableFilter,
  useDataTableFilters,
} from "@/components/data-table-filter";
import type { FiltersState } from "@/components/data-table-filter/core/types";

import { useQuery } from "@tanstack/react-query";
import { Award, BookOpen, ShieldCheck } from "lucide-react";
import { coachQueries } from "../../../coaches/queries/coaches";
import { CoachesDataTable } from "../../../coaches/components/table/data-table";
import { TableFilterSkeleton, TableSkeleton } from "../../../coaches/components/table/table-skeleton";
import { getCapacityColumns } from "./columns";
import { capacityColumnsConfig } from "./filters";

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
    icon: <BookOpen className="h-3 w-3" />,
  }));
}


export function CapacityTable({
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
  const facetedClientCounts = useQuery(coachQueries.faceted.clientCounts());

  // Create options for filters
  const typeOptions = createTypeOptions(facetedTypes.data);
  const specializationOptions = createSpecializationOptions(facetedSpecializations.data);

  const isOptionsDataPending =
    facetedTypes.isPending ||
    facetedSpecializations.isPending ||
    facetedClientCounts.isPending;

  // Create data table filters instance
  const { columns, filters, actions, strategy } = useDataTableFilters({
    strategy: "server",
    data: coaches.data ?? [],
    columnsConfig: capacityColumnsConfig,
    filters: state.filters,
    onFiltersChange: state.setFilters,
    options: {
      type: typeOptions,
      specialization: specializationOptions,
    },
    faceted: {
      type: facetedTypes.data,
      specialization: facetedSpecializations.data,
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
          numCols={getCapacityColumns(userRole).length}
          numRows={10}
        />
      ) : (
        <CapacityDataTable
          data={coaches.data || []}
          userRole={userRole}
        />
      )}
    </div>
  );
}

// Create a wrapper around CoachesDataTable with capacity-specific columns
function CapacityDataTable({
  data,
  userRole,
}: {
  data: any[];
  userRole?: string;
}) {
  // We'll create a custom data table component specifically for capacity
  // that uses the capacity columns instead of coach columns
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  // Get capacity-specific columns
  const capacityColumns = getCapacityColumns(userRole);

  const table = useReactTable({
    data,
    columns: capacityColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      rowSelection,
    },
  });

  // Use the sticky columns hook from coaches table
  const { getStickyStyle, getStickyClassName } = useStickyColumns({
    table,
  });

  return (
    <div className="space-y-4">
      <div className="scrollbar-hide overflow-x-auto overscroll-x-none rounded-md border border-border md:border-r md:border-l [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={getStickyClassName(
                        header.column.id,
                        (header.column.columnDef.meta as any)?.className
                      )}
                      style={getStickyStyle(header.column.id)}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="h-[40px] select-text md:h-[45px]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={getStickyClassName(
                        cell.column.id,
                        cn(
                          (cell.column.columnDef.meta as any)?.className,
                          (cell.column.columnDef.meta as any)?.cellClassName,
                          "relative"
                        )
                      )}
                      style={getStickyStyle(cell.column.id)}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={capacityColumns.length}
                  className="h-24 text-center"
                >
                  No coaches found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

// Add the necessary imports for the custom data table
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useStickyColumns } from "../../../coaches/components/table/hooks/use-sticky-columns";