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
import type { CoachTableRow } from "../../types/coach";
import { getCoachColumns } from "./columns";
import { useStickyColumns } from "./hooks/use-sticky-columns";

interface DataTableProps {
  data: CoachTableRow[];
  hideColumns?: string[];
  userRole?: string;
}

export function CoachesDataTable({
  data,
  hideColumns = [],
  userRole,
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  // Get columns based on user role
  const coachColumns = getCoachColumns(userRole);

  // Filter out columns that should be hidden
  const visibleColumns = coachColumns.filter(
    (col) => !hideColumns.includes(col.id || "")
  );

  const table = useReactTable({
    data,
    columns: visibleColumns,
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

  // Use the sticky columns hook
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
                  colSpan={coachColumns.length}
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
        {/*    <div className="flex-1 text-muted-foreground text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div> */}
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
