"use client";

import type { Database } from "@/utils/supabase/database.types";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";
import { UniversalDataTableWrapper } from "@/components/universal-data-table/universal-data-table-wrapper";
import { createUniversalColumnHelper } from "@/components/universal-data-table/utils/column-helpers";
import { useUniversalTable } from "@/components/universal-data-table/hooks/use-universal-table";
import { DataTableFilter } from "@/components/data-table-filter";
import { UniversalTableSkeleton } from "@/components/universal-data-table/table-skeleton";

import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  CalendarIcon,
  EditIcon,
  EyeIcon,
  PaletteIcon,
  TagIcon,
  TrashIcon,
} from "lucide-react";
import { toast } from "sonner";

import { useDeleteWinTag, useWinTagsWithFaceted } from "../queries/useWinTags";
import { Checkbox } from "@/components/ui/checkbox";

type WinTagRow = Database["public"]["Tables"]["win_tags"]["Row"];

// Column definitions
const columnHelper = createColumnHelper<WinTagRow>();

const winTagTableColumns = [
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
  columnHelper.accessor("name", {
    header: "Name",
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => {
      const name = row.getValue<string>("name");
      return <div className="font-medium">{name}</div>;
    },
  }),
  columnHelper.accessor("color", {
    header: "Color",
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => {
      const color = row.getValue<string>("color");
      return (
        <div className="flex items-center gap-2">
          <div
            className="h-6 w-6 rounded border"
            style={{ backgroundColor: color }}
          />
          <span className="font-mono text-sm">{color}</span>
        </div>
      );
    },
  }),
  columnHelper.accessor("created_at", {
    header: "Created At",
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => {
      const date = row.getValue<string>("created_at");
      if (!date) return "-";
      try {
        return format(new Date(date), "MMM dd, yyyy");
      } catch {
        return "-";
      }
    },
  }),
];

// Filter configuration using universal column helper
const universalColumnHelper = createUniversalColumnHelper<WinTagRow>();

function WinTagsTableContent(props: any) {
  const {
    filters,
    currentPage,
    sorting,
    setFilters,
    setCurrentPage,
    setSorting,
  } = props;

  const {
    data: winTagsWithFaceted,
    isLoading,
    isError,
    error,
  } = useWinTagsWithFaceted(
    filters,
    currentPage,
    25,
    sorting,
    ["color"] // columns to get faceted data for
  );

  const deleteWinTag = useDeleteWinTag();

  const handleDelete = async (win_tag: WinTagRow) => {
    try {
      await deleteWinTag.mutateAsync(win_tag.id);
      toast.success("Win tag deleted successfully");
    } catch (error) {
      toast.error("Failed to delete win tag");
    }
  };
  // Extract data from combined result
  const winTagsData = winTagsWithFaceted
    ? {
        data: winTagsWithFaceted.winTags,
        count: winTagsWithFaceted.totalCount,
      }
    : { data: [], count: 0 };

  const colorFaceted = winTagsWithFaceted?.facetedData?.color;

  const rowActions = [
    {
      label: "View Details",
      icon: EyeIcon,
      onClick: (win_tag: WinTagRow) => {
        // Placeholder for view details
        toast.info("View details functionality not implemented yet");
      },
    },
    {
      label: "Edit",
      icon: EditIcon,
      onClick: (win_tag: WinTagRow) => {
        // Placeholder for edit functionality
        toast.info("Edit functionality not implemented yet");
      },
    },
    {
      label: "Delete",
      icon: TrashIcon,
      variant: "destructive" as const,
      onClick: (win_tag: WinTagRow) => {
        handleDelete(win_tag);
      },
    },
  ];

  // Build filter config with faceted data
  const filterConfig = [
    universalColumnHelper
      .text("name")
      .displayName("Name")
      .icon(TagIcon)
      .build(),
    {
      ...universalColumnHelper
        .option("color")
        .displayName("Color")
        .icon(PaletteIcon)
        .build(),
      options: colorFaceted
        ? Array.from(colorFaceted.entries()).map(([value, count]) => ({
            value,
            label: (
              <div className="flex items-center gap-2">
                <div
                  className="h-4 w-4 rounded border"
                  style={{ backgroundColor: value }}
                />
                <span>({count})</span>
              </div>
            )
          }))
        : [],
    } as any,
    universalColumnHelper
      .date("created_at")
      .displayName("Created At")
      .icon(CalendarIcon)
      .build(),
  ];

  // Create table instance using useUniversalTable hook
  const { table, filterColumns, filterState, actions, strategy, totalCount } =
    useUniversalTable<WinTagRow>({
      data: winTagsData?.data || [],
      totalCount: winTagsData?.count || 0,
      columns: winTagTableColumns,
      columnsConfig: filterConfig,
      filters,
      onFiltersChange: setFilters,
      faceted: { color: colorFaceted },
      enableSelection: true,
      pageSize: 25,
      serverSide: true,
      rowActions,
      isLoading,
      isError,
      error,
      onPaginationChange: (pageIndex: number) => {
        setCurrentPage(pageIndex);
      },
      onSortingChange: setSorting,
    });

  if (isError) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-red-500">Error loading win tags: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 pb-4">
        <DataTableFilter
          filters={filterState}
          columns={filterColumns}
          actions={actions}
          strategy={strategy}
        />
      </div>

      {isLoading ? (
        <UniversalTableSkeleton
          numCols={winTagTableColumns.length}
          numRows={10}
        />
      ) : (
        <UniversalDataTable
          table={table}
          actions={actions}
          emptyStateMessage="No win tags found matching your filters."
          totalCount={totalCount}
          serverSide={true}
		  rowActions={rowActions}
        />
      )}
    </div>
  );
}

export function WinTagsDataTable() {
  return (
    <UniversalDataTableWrapper<WinTagRow>
      table="win_tags"
      columns={winTagTableColumns}
      columnsConfig={[
        universalColumnHelper
          .text("name")
          .displayName("Name")
          .icon(TagIcon)
          .build(),
        universalColumnHelper
          .option("color")
          .displayName("Color")
          .icon(PaletteIcon)
          .build(),
        universalColumnHelper
          .date("created_at")
          .displayName("Created At")
          .icon(CalendarIcon)
          .build(),
      ]}
      urlStateKey="winTagFilters"
    >
      {(state) => <WinTagsTableContent {...state} />}
    </UniversalDataTableWrapper>
  );
}
