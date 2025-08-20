"use client";

import { useMemo, useState } from "react";

import {
  DataTableFilter,
  useDataTableFilters,
} from "@/components/data-table-filter";
import type { FiltersState } from "@/components/data-table-filter/core/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

import { ClientsGrid } from "@/features/clients/components/ClientsGrid";
import { ClientsTable } from "@/features/clients/components/ClientsTable";
import { clientColumnsConfig } from "@/features/clients/components/table/filters";
import ClientsHeader from "@/features/clients/layout/clients-header";
import { CreateClientModal } from "@/features/clients/modals/CreateClientModal";
import { EditClientModal } from "@/features/clients/modals/EditClientModal";
import { useClients, useUsersForAssignment } from "@/features/clients/queries";

import { AlertCircle, Grid, List, Search, Users } from "lucide-react";
import { parseAsJson, useQueryState } from "nuqs";
import { z } from "zod";

const filtersSchema = z.custom<FiltersState>();

export function ClientsPageContent() {
  const [view, setView] = useState<"table" | "grid">("table");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);

  // Manage filters state with URL persistence
  const [filtersState, setFiltersState] = useQueryState<FiltersState>(
    "filters",
    parseAsJson(filtersSchema.parse).withDefault([])
  );

  // Fetch data using React Query
  const { data: clientsData = [], isLoading, error } = useClients();
  const { data: users = [] } = useUsersForAssignment() || {};

  // Create faceted data for filters
  const facetedData = useMemo(() => {
    if (!clientsData || clientsData.length === 0) return {};

    const statuses = new Map<string, number>();
    const productNames = new Map<string, number>();

    clientsData.forEach((client) => {
      // Status facets
      if (client.status) {
        statuses.set(client.status, (statuses.get(client.status) || 0) + 1);
      }

      // Product facets
      if (client.product?.name) {
        productNames.set(
          client.product.name,
          (productNames.get(client.product.name) || 0) + 1
        );
      }
    });

    return {
      status: statuses,
      product: productNames,
    };
  }, [clientsData]);

  // Create options for filters
  const filterOptions = useMemo(() => {
    return {
      status: Array.from(facetedData.status?.entries() || []).map(
        ([value, count]) => ({
          value,
          label: value.charAt(0).toUpperCase() + value.slice(1),
          count,
        })
      ),
      product: Array.from(facetedData.product?.entries() || []).map(
        ([value, count]) => ({
          value,
          label: value,
          count,
        })
      ),
    };
  }, [facetedData]);

  // Create data table filters instance
  const { columns, filters, actions, strategy } = useDataTableFilters({
    strategy: "client",
    data: clientsData,
    columnsConfig: clientColumnsConfig as any,
    filters: filtersState,
    onFiltersChange: setFiltersState,
    options: filterOptions,
    faceted: facetedData,
  });

  // Apply filters to data
  const filteredData = useMemo(() => {
    if (!clientsData) return [];
    if (filtersState.length === 0) return clientsData;

    return clientsData.filter((client) => {
      return filtersState.every((filter) => {
        const column = columns.find((col) => col.id === filter.columnId);
        if (!column) return true;

        const value = column.accessor(client);

        if (filter.type === "text") {
          const searchValue = filter.values[0]?.toLowerCase() || "";
          const cellValue = String(value || "").toLowerCase();
          return cellValue.includes(searchValue);
        }

        if (filter.type === "option" || filter.type === "multiOption") {
          if (!value) return false;
          return filter.values.includes(String(value));
        }

        if (filter.type === "date") {
          if (!value) return false;
          const date = new Date(value as string);
          const [from, to] = filter.values;
          if (from && to) {
            return date >= new Date(from) && date <= new Date(to);
          }
          return true;
        }

        if (filter.type === "number") {
          if (value === null || value === undefined) return false;
          const numValue = Number(value);
          const [min, max] = filter.values;
          return numValue >= min && numValue <= max;
        }

        return true;
      });
    });
  }, [clientsData, filtersState, columns]);

  const handleEditClient = (client: any) => {
    setSelectedClient(client);
    setIsEditModalOpen(true);
  };

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load clients. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="bg-background">
      {/* Header */}
      <ClientsHeader
        permissions={{}}
        onAddClient={() => setIsCreateModalOpen(true)}
      />

      <div className="space-y-6 p-6">
        {/* Title */}

        {/* Filters and Controls */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <DataTableFilter
              filters={filters}
              columns={columns}
              actions={actions}
              strategy={strategy}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={view === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("table")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div>
          {isLoading ? (
            <LoadingSkeleton
              type={view === "table" ? "table" : "cards"}
              count={8}
            />
          ) : filteredData.length === 0 ? (
            <EmptyState
              icon={filtersState.length > 0 ? Search : Users}
              title={
                filtersState.length > 0 ? "No clients found" : "No clients yet"
              }
              description={
                filtersState.length > 0
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first client"
              }
              actionLabel={filtersState.length > 0 ? undefined : "Add Client"}
              onAction={
                filtersState.length > 0
                  ? undefined
                  : () => setIsCreateModalOpen(true)
              }
            />
          ) : view === "table" ? (
            <ClientsTable clients={filteredData} onEdit={handleEditClient} />
          ) : (
            <ClientsGrid clients={filteredData} onEdit={handleEditClient} />
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateClientModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        users={users as any}
      />

      {selectedClient && (
        <EditClientModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedClient(null);
          }}
          client={selectedClient}
          users={users as any}
        />
      )}
    </div>
  );
}
