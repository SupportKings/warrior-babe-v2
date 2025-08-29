"use client";

import { useEffect, useState } from "react";

import type { Database } from "@/utils/supabase/database.types";

import { DataTableFilter } from "@/components/data-table-filter";
import { Checkbox } from "@/components/ui/checkbox";
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
  EditIcon,
  EyeIcon,
  FileTextIcon,
  LinkIcon,
  TagIcon,
  TrashIcon,
  UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { deleteClientTestimonial } from "../actions/deleteClientTestimonial";
import { useClientTestimonialsWithFaceted } from "../queries/useClientTestimonials";
import { ClientTestimonialDeleteModal } from "./client-testimonial.delete.modal";

// Type for client testimonial row from Supabase
type ClientTestimonialRow =
  Database["public"]["Tables"]["client_testimonials"]["Row"] & {
    client?: {
      id: string;
      name: string;
      email: string;
    } | null;
    recorded_by_user?: {
      id: string;
      name: string;
      email: string;
    } | null;
  };

// Create column helper for TanStack table
const columnHelper = createColumnHelper<ClientTestimonialRow>();

// TanStack table column definitions
const clientTestimonialTableColumns = [
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
  columnHelper.display({
    id: "client_name",
    header: "Client",
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => {
      const client = row.original.client;
      return <div className="font-medium">{client?.name || "—"}</div>;
    },
  }),
  columnHelper.accessor("testimonial_type", {
    id: "testimonial_type",
    header: "Type",
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => {
      const type = row.getValue<string>("testimonial_type");
      return (
        <div className="flex items-center gap-1">
          <TagIcon className="h-3 w-3 text-muted-foreground" />
          <span>{type || "—"}</span>
        </div>
      );
    },
  }),
  columnHelper.accessor("testimonial_url", {
    id: "testimonial_url",
    header: "URL",
    enableColumnFilter: false,
    enableSorting: false,
    cell: ({ row }) => {
      const url = row.getValue<string>("testimonial_url");
      if (!url) return <span className="text-muted-foreground">—</span>;
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-blue-600 hover:underline"
        >
          <LinkIcon className="h-3 w-3" />
          <span className="text-xs">View</span>
        </a>
      );
    },
  }),
  columnHelper.accessor("content", {
    id: "content",
    header: "Content",
    enableColumnFilter: false,
    enableSorting: false,
    cell: ({ row }) => {
      const content = row.getValue<string>("content");
      return (
        <div className="max-w-xs truncate text-sm text-muted-foreground">
          {content || "—"}
        </div>
      );
    },
  }),
  columnHelper.accessor("recorded_date", {
    id: "recorded_date",
    header: "Recorded Date",
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => {
      const date = row.getValue<string>("recorded_date");
      if (!date) return null;
      return format(new Date(date), "MMM dd, yyyy");
    },
  }),
  columnHelper.display({
    id: "recorded_by",
    header: "Recorded By",
    enableColumnFilter: false,
    enableSorting: false,
    cell: ({ row }) => {
      const user = row.original.recorded_by_user;
      return <div className="text-sm">{user?.name || "—"}</div>;
    },
  }),
];

// Filter configuration using universal column helper
const universalColumnHelper =
  createUniversalColumnHelper<ClientTestimonialRow>();

const clientTestimonialFilterConfig = [
  universalColumnHelper
    .option("client_id")
    .displayName("Client")
    .icon(UserIcon)
    .build(),
  universalColumnHelper
    .option("testimonial_type")
    .displayName("Type")
    .icon(TagIcon)
    .build(),
  universalColumnHelper
    .text("content")
    .displayName("Content")
    .icon(FileTextIcon)
    .build(),
  universalColumnHelper
    .date("recorded_date")
    .displayName("Recorded Date")
    .icon(CalendarIcon)
    .build(),
];

function ClientTestimonialsTableContent({
  filters,
  setFilters,
}: {
  filters: any;
  setFilters: any;
}) {
  const queryClient = useQueryClient();
  const [testimonialToDelete, setTestimonialToDelete] =
    useState<ClientTestimonialRow | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [sorting, setSorting] = useState<any[]>([]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [filters]);

  // Fetch testimonials data with faceted data in single optimized call
  const {
    data: testimonialsWithFaceted,
    isLoading,
    isError,
    error,
  } = useClientTestimonialsWithFaceted(
    filters,
    currentPage,
    25,
    sorting,
    ["testimonial_type"] // columns to get faceted data for
  );

  // Extract data from combined result
  const testimonialsData = testimonialsWithFaceted
    ? {
        data: testimonialsWithFaceted.testimonials,
        count: testimonialsWithFaceted.totalCount,
      }
    : { data: [], count: 0 };

  const testimonialTypeFaceted: any =
    testimonialsWithFaceted?.facetedData &&
    "testimonial_type" in testimonialsWithFaceted.facetedData
      ? testimonialsWithFaceted.facetedData.testimonial_type
      : undefined;
  const clients = testimonialsWithFaceted?.clients || [];
  // Create dynamic filter config with proper types based on database schema
  const dynamicFilterConfig = [
    {
      ...universalColumnHelper
        .option("client_id")
        .displayName("Client")
        .icon(UserIcon)
        .build(),
      options: clients.map((client: any) => ({
        value: client.id,
        label: client.name,
      })),
    },
    {
      ...universalColumnHelper
        .option("testimonial_type")
        .displayName("Type")
        .icon(TagIcon)
        .build(),
      options: testimonialTypeFaceted
        ? Array.from(
            new Set(testimonialTypeFaceted.map((f: any) => f.value))
          ).map((value) => ({
            value,
            label: value as string,
          }))
        : [],
    },
    universalColumnHelper
      .text("content")
      .displayName("Content")
      .icon(FileTextIcon)
      .build(),
    universalColumnHelper
      .date("recorded_date")
      .displayName("Recorded Date")
      .icon(CalendarIcon)
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
      onClick: (testimonial: ClientTestimonialRow) => {
        setTestimonialToDelete(testimonial);
      },
    },
  ];

  const { table, filterColumns, filterState, actions, strategy, totalCount } =
    useUniversalTable<ClientTestimonialRow>({
      data: testimonialsData?.data || [],
      totalCount: testimonialsData?.count || 0,
      columns: clientTestimonialTableColumns,
      columnsConfig: dynamicFilterConfig,
      filters,
      onFiltersChange: setFilters,
      faceted: { testimonial_type: testimonialTypeFaceted },
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
          Failed to load client testimonials: {error?.message}
        </p>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!testimonialToDelete?.id) return;

    try {
      const result = await deleteClientTestimonial({
        id: testimonialToDelete.id,
      });
      if (result?.data?.success) {
        toast.success("Client testimonial deleted successfully");
        // Invalidate queries to refresh the data
        queryClient.invalidateQueries({ queryKey: ["clientTestimonials"] });
        setTestimonialToDelete(null);
      } else {
        toast.error(
          result?.data?.error || "Failed to delete client testimonial"
        );
      }
    } catch (error) {
      toast.error("An error occurred while deleting the client testimonial");
    }
  };

  return (
    <>
      {/* Filters */}
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

      {/* Data Table */}
      {isLoading ? (
        <UniversalTableSkeleton numCols={7} numRows={10} />
      ) : (
        <UniversalDataTable
          table={table}
          actions={actions}
          totalCount={totalCount}
          rowActions={rowActions}
        />
      )}

      {/* Delete Modal */}
      <ClientTestimonialDeleteModal
        open={!!testimonialToDelete}
        onOpenChange={(open) => !open && setTestimonialToDelete(null)}
        onConfirm={handleDelete}
        testimonialInfo={
          testimonialToDelete
            ? {
                client: testimonialToDelete.client?.name || "Unknown",
                type: testimonialToDelete.testimonial_type || "Unknown",
              }
            : undefined
        }
      />
    </>
  );
}

export function ClientTestimonialsDataTable() {
  return (
    <UniversalDataTableWrapper<ClientTestimonialRow>
      table="clientTestimonials"
      columns={clientTestimonialTableColumns}
      columnsConfig={clientTestimonialFilterConfig}
      urlStateKey="clientTestimonialFilters"
    >
      {(state) => <ClientTestimonialsTableContent {...state} />}
    </UniversalDataTableWrapper>
  );
}
