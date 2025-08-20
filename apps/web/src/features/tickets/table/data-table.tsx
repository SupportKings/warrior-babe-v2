import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

import type { DataTableFilterActions, FiltersState } from "@/components/data-table-filter/core/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useQueryClient } from "@tanstack/react-query";
import { flexRender, type Table as TanStackTable } from "@tanstack/react-table";
import { XIcon } from "lucide-react";
import { getTicket } from "../queries/getTicket";

export function DataTable({
  table,
  actions,
  filters,
}: {
  table: TanStackTable<any>;
  actions?: DataTableFilterActions;
  filters?: FiltersState;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  return (
    <>
      <div className="">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "first:pl-6 last:pr-6",
                        (header.column.columnDef.meta as any)?.className
                      )}
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
                  className="h-12 cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    const ticket = row.original as any;
                    if (ticket?.id) {
                      router.push(`/dashboard/tickets/${ticket.id}`);
                    }
                  }}
                  onMouseEnter={() => {
                    const ticket = row.original as any;
                    if (ticket?.id) {
                      queryClient.prefetchQuery({
                        queryKey: ["ticket", ticket.id],
                        queryFn: () => getTicket(ticket.id),
                        staleTime: 1000 * 60 * 5, // 5 minutes
                      });
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      className={cn(
                        "h-12 first:pl-6 last:pr-6",
                        (cell.column.columnDef.meta as any)?.className
                      )}
                      key={cell.id}
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
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-[calc(var(--spacing)*12*10)]"
                >
                  <div className="flex flex-col items-center justify-center gap-8">
                    <div className="flex flex-col gap-4 text-center font-[450]">
                      <span>
                        {filters && filters.length > 0 ? "No tickets matching your filters." : "No tickets yet."}
                      </span>
                      <div className="flex flex-col gap-2">
                        <span className="text-muted-foreground">
                          {filters && filters.length > 0 
                            ? "Adjust or clear filters to reveal tickets." 
                            : "Tickets will appear here when they are created."}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn("gap-1", (!actions || !filters || filters.length === 0) && "hidden")}
                          onClick={actions?.removeAllFilters}
                        >
                          <XIcon className="text-muted-foreground" />
                          Clear filters
                        </Button>
                      </div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mx-6 flex items-center justify-end space-x-2 py-4">
        {/*     <div className="flex-1 text-muted-foreground text-sm tabular-nums">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.{" "}
          <span className="font-medium text-primary">
            Total row count: {table.getCoreRowModel().rows.length}
          </span>
        </div> */}
        {(table.getCanPreviousPage() || table.getCanNextPage()) && (
          <div className="flex gap-2">
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
        )}
      </div>
    </>
  );
}
