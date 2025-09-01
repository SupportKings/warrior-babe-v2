"use client";

import { useEffect, useState } from "react";

import type { Database } from "@/utils/supabase/database.types";

import { DataTableFilter } from "@/components/data-table-filter";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/ui/status-badge";
import { getPaymentStatusColor } from "@/features/coaches/utils/payment-status-colors";
import { useUniversalTable } from "@/components/universal-data-table/hooks/use-universal-table";
import {
  UniversalTableFilterSkeleton,
  UniversalTableSkeleton,
} from "@/components/universal-data-table/table-skeleton";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";
import { UniversalDataTableWrapper } from "@/components/universal-data-table/universal-data-table-wrapper";
import { createUniversalColumnHelper } from "@/components/universal-data-table/utils/column-helpers";

import { useQueryClient } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import {
  EditIcon,
  EyeIcon,
  HashIcon,
  PlusIcon,
  TagIcon,
  TrashIcon,
  UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { deleteCoachPayment } from "../actions/deleteCoachPayment";
import { useCoachPaymentsWithFaceted } from "../queries/useCoachPayments";
import { CoachPaymentDeleteModal } from "./coach-payment.delete.modal";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Type for coach payment row from Supabase view
type CoachPaymentRow =
  Database["public"]["Views"]["coach_payments_list_view"]["Row"];

// Create column helper for TanStack table
const columnHelper = createColumnHelper<CoachPaymentRow>();

// TanStack table column definitions
const coachPaymentTableColumns = [
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
  }),
  columnHelper.accessor("coach_name", {
    id: "coach_name",
    header: "Coach",
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => {
      const name = row.getValue<string>("coach_name");
      return <div className="font-medium">{name || "—"}</div>;
    },
  }),
  columnHelper.accessor("status", {
    id: "status",
    header: "Status",
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => {
      const status = row.getValue<string>("status");
      return (
        <StatusBadge colorScheme={getPaymentStatusColor(status)}>
          {status || "Not Paid"}
        </StatusBadge>
      );
    },
  }),
  columnHelper.accessor("number_of_activity_periods", {
    id: "number_of_activity_periods",
    header: "Number Of Activity Periods",
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => {
      const count = row.getValue<number>("number_of_activity_periods");
      return (
        <div className="flex items-center gap-1">
          <HashIcon className="h-3 w-3 text-muted-foreground" />
          <span className="font-medium">{count || 0}</span>
        </div>
      );
    },
  }),
];

// Filter configuration using universal column helper
const universalColumnHelper = createUniversalColumnHelper<CoachPaymentRow>();

const coachPaymentFilterConfig = [
  universalColumnHelper
    .text("coach_name")
    .displayName("Coach")
    .icon(UserIcon)
    .build(),
  universalColumnHelper
    .option("status")
    .displayName("Status")
    .icon(TagIcon)
    .build(),
  universalColumnHelper
    .number("number_of_activity_periods")
    .displayName("Number Of Activity Periods")
    .icon(HashIcon)
    .build(),
];

function CoachPaymentsTableContent({
  filters,
  setFilters,
}: {
  filters: any;
  setFilters: any;
}) {
  const queryClient = useQueryClient();
  const [paymentToDelete, setPaymentToDelete] =
    useState<CoachPaymentRow | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [sorting, setSorting] = useState<any[]>([]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [filters]);

  // Fetch coach payments data with faceted data in single optimized call
  const {
    data: coachPaymentsWithFaceted,
    isLoading,
    isError,
    error,
  } = useCoachPaymentsWithFaceted(
    filters,
    currentPage,
    25,
    sorting,
    ["status"] // columns to get faceted data for
  );

  // Extract data from combined result
  const coachPaymentsData = coachPaymentsWithFaceted
    ? {
        data: coachPaymentsWithFaceted.coachPayments,
        count: coachPaymentsWithFaceted.totalCount,
      }
    : { data: [], count: 0 };

  // Convert faceted data to Map format
  const statusFaceted = new Map<string, number>();
  if (coachPaymentsWithFaceted?.facetedData?.status) {
    coachPaymentsWithFaceted.facetedData.status.forEach((item: any) => {
      statusFaceted.set(item.value, item.count);
    });
  }

  // Create dynamic filter config with proper types based on database schema
  const dynamicFilterConfig = [
    universalColumnHelper
      .text("coach_name")
      .displayName("Coach")
      .icon(UserIcon)
      .build(),
    {
      ...universalColumnHelper
        .option("status")
        .displayName("Status")
        .icon(TagIcon)
        .build(),
      options: [
        { value: "Paid", label: "Paid" },
        { value: "Not Paid", label: "Not Paid" },
      ],
    },
    universalColumnHelper
      .number("number_of_activity_periods")
      .displayName("Number Of Activity Periods")
      .icon(HashIcon)
      .build(),
  ];

  const rowActions = [
    {
      label: "View Details",
      icon: EyeIcon,
      onClick: () => {
        // Placeholder for view action
        toast.info("View functionality coming soon");
      },
    },
    {
      label: "Edit",
      icon: EditIcon,
      onClick: () => {
        // Placeholder for edit action
        toast.info("Edit functionality coming soon");
      },
    },
    {
      label: "Delete",
      icon: TrashIcon,
      variant: "destructive" as const,
      onClick: (payment: CoachPaymentRow) => {
        setPaymentToDelete(payment);
      },
    },
  ];

  const { table, filterColumns, filterState, actions, strategy, totalCount } =
    useUniversalTable<CoachPaymentRow>({
      data: coachPaymentsData?.data || [],
      totalCount: coachPaymentsData?.count || 0,
      columns: coachPaymentTableColumns,
      columnsConfig: dynamicFilterConfig,
      filters,
      onFiltersChange: setFilters,
      faceted: { status: statusFaceted },
      enableSelection: true,
      pageSize: 25,
      serverSide: true,
      rowActions,
      isLoading,
      onPaginationChange: setCurrentPage,
      onSortingChange: setSorting,
    });

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-destructive text-sm">
          Failed to load coach payments: {error?.message}
        </p>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!paymentToDelete?.coach_payment_id) return;

    try {
      const result = await deleteCoachPayment({
        id: paymentToDelete.coach_payment_id,
      });
      if (result?.data?.success) {
        toast.success("Coach payment deleted successfully");
        // Invalidate queries to refresh the data
        queryClient.invalidateQueries({ queryKey: ["coachPayments"] });
        setPaymentToDelete(null);
      } else {
        toast.error(result?.data?.error || "Failed to delete coach payment");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the coach payment");
    }
  };

  return (
    <div className="w-full">
      {/* Filters */}
      <div className="flex items-center gap-2 pb-4">
        {isLoading ? (
          <UniversalTableFilterSkeleton />
        ) : (
          <DataTableFilter
            filters={filterState}
            columns={filterColumns}
            actions={actions}
            strategy={strategy}
          />
        )}
      </div>

      {/* Data Table */}
      {isLoading ? (
        <UniversalTableSkeleton numCols={4} numRows={10} />
      ) : (
        <UniversalDataTable
          table={table}
          actions={actions}
          totalCount={totalCount}
          rowActions={rowActions}
          emptyStateMessage="No payments found matching your filters"
          emptyStateAction={
            <Button size="sm" className="gap-2" asChild>
              <Link href="#">
                <PlusIcon className="h-4 w-4" />
                Add Payment
              </Link>
            </Button>
          }
        />
      )}

      {/* Delete Modal */}
      <CoachPaymentDeleteModal
        open={!!paymentToDelete}
        onOpenChange={(open) => !open && setPaymentToDelete(null)}
        onConfirm={handleDelete}
        paymentInfo={
          paymentToDelete
            ? {
                coach: paymentToDelete.coach_name || "Unknown",
                periods: paymentToDelete.number_of_activity_periods || 0,
              }
            : undefined
        }
      />
    </div>
  );
}

export function CoachPaymentsDataTable() {
  return (
    <UniversalDataTableWrapper<CoachPaymentRow>
      table="coachPayments"
      columns={coachPaymentTableColumns}
      columnsConfig={coachPaymentFilterConfig}
      urlStateKey="coachPaymentFilters"
    >
      {(state) => <CoachPaymentsTableContent {...state} />}
    </UniversalDataTableWrapper>
  );
}
