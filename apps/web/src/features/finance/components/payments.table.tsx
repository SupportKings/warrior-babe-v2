"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import type { Database } from "@/utils/supabase/database.types";

import { DataTableFilter } from "@/components/data-table-filter";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/ui/status-badge";
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
import { format } from "date-fns";
import {
  CalendarIcon,
  CreditCardIcon,
  DollarSignIcon,
  EditIcon,
  EyeIcon,
  PackageIcon,
  PlusIcon,
  ShieldAlertIcon,
  TrashIcon,
  UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  useClientsForFilter,
  usePaymentsWithFaceted,
  useProductsForFilter,
} from "../queries/usePayments";
import { PaymentDeleteModal } from "./payment-delete-modal";

// Type for payment row from Supabase with relations
type PaymentRow = Database["public"]["Tables"]["payments"]["Row"] & {
  payment_slots?: Array<{
    id: string;
    amount_due: number;
    amount_paid: number;
    due_date: string;
    notes: string | null;
    plan_id: string | null;
    payment_plans: {
      id: string;
      name: string;
      platform: string | null;
      product_id: string | null;
      client_id: string | null;
      total_amount?: number | null;
      type?: string | null;
      clients: {
        id: string;
        name: string;
        email: string;
      } | null;
      products: {
        id: string;
        name: string;
      } | null;
    } | null;
  }>;
};

// Create column helper for TanStack table
const columnHelper = createColumnHelper<PaymentRow>();

// TanStack table column definitions
const paymentTableColumns = [
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
  columnHelper.accessor("amount", {
    id: "amount",
    header: "Amount",
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => {
      const amount = row.getValue<number | null>("amount");
      if (amount === null || amount === undefined) return "-";
      return <div className="font-medium">${amount.toLocaleString()}</div>;
    },
  }),
  columnHelper.accessor("payment_date", {
    id: "payment_date",
    header: "Payment Date",
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => {
      const date = row.getValue<string | null>("payment_date");
      if (!date) return "-";
      return format(new Date(date), "MMM dd, yyyy");
    },
  }),
  columnHelper.accessor("status", {
    id: "status",
    header: "Status",
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => {
      const status = row.getValue<string | null>("status");
      if (!status) return "-";

      // Determine color scheme based on status
      let colorScheme: "green" | "yellow" | "red" | "gray" = "gray";
      if (
        status.toLowerCase() === "paid" ||
        status.toLowerCase() === "succeeded"
      ) {
        colorScheme = "green";
      } else if (
        status.toLowerCase() === "pending" ||
        status.toLowerCase() === "processing"
      ) {
        colorScheme = "yellow";
      } else if (
        status.toLowerCase() === "failed" ||
        status.toLowerCase() === "declined"
      ) {
        colorScheme = "red";
      }

      return <StatusBadge colorScheme={colorScheme}>{status}</StatusBadge>;
    },
  }),
  columnHelper.accessor("disputed_status", {
    id: "disputed_status",
    header: "Disputed Status",
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => {
      const status = row.getValue<string | null>("disputed_status");
      if (!status) return "-";

      // Use appropriate color for dispute status
      const colorScheme =
        status === "Not Disputed"
          ? "gray"
          : status === "Dispute Won"
          ? "green"
          : status === "Dispute Lost"
          ? "red"
          : "yellow";

      return <StatusBadge colorScheme={colorScheme}>{status}</StatusBadge>;
    },
  }),
  columnHelper.accessor("platform", {
    id: "platform",
    header: "Platform",
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => {
      const platform = row.getValue<string | null>("platform");
      if (!platform) return <div className="text-sm">-</div>;

      // Capitalize first letter of each word
      const capitalizedPlatform = platform
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");

      return <div className="text-sm">{capitalizedPlatform}</div>;
    },
  }),
  columnHelper.display({
    id: "payment_slot",
    header: "Payment Slot",
    enableColumnFilter: false,
    cell: ({ row }) => {
      const slots = row.original.payment_slots;
      if (!slots || slots.length === 0) return "-";

      const slot = slots[0]; // Take first slot
      const plan = slot.payment_plans;
      const client = plan?.clients;

      if (!plan || !client) return "-";

      return (
        <div className="text-sm">
          <div className="font-medium">{client.name}</div>
          <div className="text-muted-foreground">
            ${slot.amount_due.toLocaleString()} -{" "}
            {format(new Date(slot.due_date), "MMM dd")}
          </div>
        </div>
      );
    },
  }),
  columnHelper.display({
    id: "client_id",
    header: "Client",
    enableColumnFilter: true,
    cell: ({ row }) => {
      const slots = row.original.payment_slots;
      if (!slots || slots.length === 0) return "-";

      const client = slots[0]?.payment_plans?.clients;
      if (!client) return "-";

      return <div className="font-medium">{client.name}</div>;
    },
    // Store the actual client ID for filtering
    filterFn: (row, _columnId, filterValue) => {
      const slots = row.original.payment_slots;
      if (!slots || slots.length === 0) return false;
      const clientId = slots[0]?.payment_plans?.client_id;
      return clientId === filterValue;
    },
  }),
  columnHelper.display({
    id: "product_id",
    header: "Product",
    enableColumnFilter: true,
    cell: ({ row }) => {
      const slots = row.original.payment_slots;
      if (!slots || slots.length === 0) return "-";

      const product = slots[0]?.payment_plans?.products;
      if (!product) return "-";

      return <div className="text-sm">{product.name}</div>;
    },
    // Store the actual product ID for filtering
    filterFn: (row, _columnId, filterValue) => {
      const slots = row.original.payment_slots;
      if (!slots || slots.length === 0) return false;
      const productId = slots[0]?.payment_plans?.product_id;
      return productId === filterValue;
    },
  }),
];

// Filter configuration using universal column helper
const universalColumnHelper = createUniversalColumnHelper<PaymentRow>();

function PaymentsTableContent({
  filters,
  setFilters,
}: {
  filters: any;
  setFilters: any;
}) {
  const queryClient = useQueryClient();
  const [paymentToDelete, setPaymentToDelete] = useState<PaymentRow | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [sorting, setSorting] = useState<any[]>([]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [filters]);

  // Fetch payments data with faceted data in single optimized call
  const {
    data: paymentsWithFaceted,
    isLoading,
    isError,
    error,
  } = usePaymentsWithFaceted(
    filters,
    currentPage,
    25,
    sorting,
    ["status", "disputed_status", "platform"] // columns to get faceted data for
  );

  // Fetch filter data for client and product filters
  const { data: clients } = useClientsForFilter();
  const { data: products } = useProductsForFilter();
  
  // Extract data from combined result
  const paymentsData = paymentsWithFaceted
    ? {
        data: paymentsWithFaceted.payments,
        count: paymentsWithFaceted.totalCount,
      }
    : { data: [], count: 0 };

  const statusFaceted = paymentsWithFaceted?.facetedData?.status;
  const disputedStatusFaceted =
    paymentsWithFaceted?.facetedData?.disputed_status;
  const platformFaceted = paymentsWithFaceted?.facetedData?.platform;

  // Create dynamic filter config with proper types based on database schema
  const dynamicFilterConfig = [
    universalColumnHelper
      .number("amount")
      .displayName("Amount")
      .icon(DollarSignIcon)
      .build(),
    
    {
      ...universalColumnHelper
        .option("status")
        .displayName("Status")
        .icon(CreditCardIcon)
        .build(),
      options: statusFaceted
        ? Array.from(statusFaceted.entries()).map(([value, count]) => ({
            value,
            label: (
              <div>
                <span className="capitalize">{value}</span> ({count})
              </div>
            ),
          }))
        : [],
    },
    {
      ...universalColumnHelper
        .option("disputed_status")
        .displayName("Disputed Status")
        .icon(ShieldAlertIcon)
        .build(),
      options: [
        { value: "Not Disputed", label: "Not Disputed" },
        { value: "Disputed", label: "Disputed" },
        { value: "Evidence Submtited", label: "Evidence Submitted" },
        { value: "Dispute Won", label: "Dispute Won" },
        { value: "Dispute Lost", label: "Dispute Lost" },
      ],
    },
    {
      ...universalColumnHelper
        .option("platform")
        .displayName("Platform")
        .icon(CreditCardIcon)
        .build(),
      options: platformFaceted
        ? Array.from(platformFaceted.entries()).map(([value, count]) => ({
            value,
            label: (
              <div>
                <span className="capitalize">{value}</span> ({count})
              </div>
            ),
          }))
        : [],
    },
    {
      ...(universalColumnHelper as any)
        .option("client_id")
        .displayName("Client")
        .icon(UserIcon)
        .build(),
      options: clients
        ? clients.map((client) => ({
            value: client.id,
            label: client.name,
          }))
        : [],
    },
    {
      ...(universalColumnHelper as any)
        .option("product_id")
        .displayName("Product")
        .icon(PackageIcon)
        .build(),
      options: products
        ? products.map((product) => ({
            value: product.id,
            label: product.name,
          }))
        : [],
    },
	universalColumnHelper
      .date("payment_date")
      .displayName("Payment Date")
      .icon(CalendarIcon)
      .build(),
    universalColumnHelper
      .date("declined_at")
      .displayName("Declined Date")
      .icon(CalendarIcon)
      .build(),
    universalColumnHelper
      .date("created_at")
      .displayName("Created Date")
      .icon(CalendarIcon)
      .build(),
  ];

  const rowActions = [
    {
      label: "View Details",
      icon: EyeIcon,
      onClick: (_payment: PaymentRow) => {
        // Placeholder for view action
        toast.info("View payment details - Coming soon");
      },
    },
    {
      label: "Edit",
      icon: EditIcon,
      onClick: (_payment: PaymentRow) => {
        // Placeholder for edit action
        toast.info("Edit payment - Coming soon");
      },
    },
    {
      label: "Delete",
      icon: TrashIcon,
      variant: "destructive" as const,
      onClick: (payment: PaymentRow) => {
        setPaymentToDelete(payment);
      },
    },
  ];


  const { table, filterColumns, filterState, actions, strategy, totalCount } =
    useUniversalTable<PaymentRow>({
      data: paymentsData?.data || [],
      totalCount: paymentsData?.count || 0,
      columns: paymentTableColumns,
      columnsConfig: dynamicFilterConfig,
      filters,
      onFiltersChange: setFilters,
      faceted: {
        status: statusFaceted,
        disputed_status: disputedStatusFaceted,
        platform: platformFaceted,
      },
      enableSelection: true,
      pageSize: 25,
      serverSide: true,
      rowActions,
      isLoading,
      isError,
      error,
      onPaginationChange: (pageIndex) => {
        setCurrentPage(pageIndex);
      },
      onSortingChange: setSorting,
    });

  // Check if filter options are still loading
  const isFilterDataPending = false;

  if (isError) {
    return (
      <div className="w-full">
        <div className="space-y-2 text-center">
          <p className="text-red-600">
            Error loading payments: {error?.message}
          </p>
          <p className="text-muted-foreground text-sm">
            Please check your database connection and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 pb-4">
        {isFilterDataPending ? (
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

      {isLoading ? (
        <UniversalTableSkeleton
          numCols={paymentTableColumns.length}
          numRows={10}
        />
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

      {paymentToDelete && (
        <PaymentDeleteModal
          payment={paymentToDelete}
          open={!!paymentToDelete}
          onOpenChange={(open) => !open && setPaymentToDelete(null)}
          onConfirm={async () => {
            const paymentId = paymentToDelete.id;
            const amount = paymentToDelete.amount || 0;

            if (!paymentId) {
              toast.error("Payment ID is missing");
              throw new Error("Payment ID is missing");
            }

            try {
              const { deletePayment } = await import(
                "../actions/deletePayment"
              );
              await deletePayment({ id: paymentId });

              // Refresh the table after successful deletion
              queryClient.invalidateQueries({ queryKey: ["payments"] });
              setPaymentToDelete(null);

              // Show success toast
              toast.success(
                `Payment of $${amount.toLocaleString()} has been deleted successfully`
              );
            } catch (error) {
              // Show error toast
              toast.error(`Failed to delete payment. Please try again.`);
              throw error;
            }
          }}
        />
      )}
    </div>
  );
}

export function PaymentsDataTable() {
  return (
    <UniversalDataTableWrapper<PaymentRow>
      table="payments"
      columns={paymentTableColumns}
      columnsConfig={[
        (universalColumnHelper as any)
          .option("client_id")
          .displayName("Client")
          .icon(UserIcon)
          .build(),
        (universalColumnHelper as any)
          .option("product_id")
          .displayName("Product")
          .icon(PackageIcon)
          .build(),
        universalColumnHelper
          .option("platform")
          .displayName("Platform")
          .icon(CreditCardIcon)
          .build(),
        universalColumnHelper
          .option("status")
          .displayName("Status")
          .icon(CreditCardIcon)
          .build(),
        universalColumnHelper
          .option("disputed_status")
          .displayName("Disputed Status")
          .icon(ShieldAlertIcon)
          .build(),
        universalColumnHelper
          .number("amount")
          .displayName("Amount")
          .icon(DollarSignIcon)
          .build(),
        universalColumnHelper
          .date("payment_date")
          .displayName("Payment Date")
          .icon(CalendarIcon)
          .build(),
        universalColumnHelper
          .date("declined_at")
          .displayName("Declined Date")
          .icon(CalendarIcon)
          .build(),
        universalColumnHelper
          .date("created_at")
          .displayName("Created Date")
          .icon(CalendarIcon)
          .build(),
      ]}
      urlStateKey="paymentFilters"
    >
      {(state) => <PaymentsTableContent {...state} />}
    </UniversalDataTableWrapper>
  );
}