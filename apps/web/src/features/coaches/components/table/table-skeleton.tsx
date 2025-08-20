import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TableSkeleton({
  numCols,
  numRows,
}: {
  numCols: number;
  numRows: number;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: numCols }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-4 w-20" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: numRows }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: numCols }).map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function TableFilterSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-9 w-[200px]" />
      <Skeleton className="h-9 w-[120px]" />
      <Skeleton className="h-9 w-[120px]" />
    </div>
  );
}