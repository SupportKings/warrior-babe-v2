"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

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
import {
	CalendarIcon,
	EditIcon,
	EyeIcon,
	PackageIcon,
	PlusIcon,
	TagIcon,
	TrashIcon,
} from "lucide-react";
import { toast } from "sonner";
import { deleteProduct } from "../actions/deleteProduct";
import { useProductsWithFaceted } from "../queries/useProducts";
import { ProductDeleteModal } from "./product.delete.modal";

// Type for product row from Supabase
type ProductRow = Database["public"]["Tables"]["products"]["Row"];

// Create column helper for TanStack table
const columnHelper = createColumnHelper<ProductRow>();

// TanStack table column definitions
const productTableColumns = [
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
		id: "name",
		header: "Name",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => {
			const name = row.getValue<string>("name");
			return <div className="font-medium">{name}</div>;
		},
	}),
	columnHelper.accessor("description", {
		id: "description",
		header: "Description",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => {
			const description = row.getValue<string>("description");
			return <div className="text-muted-foreground">{description || "—"}</div>;
		},
	}),
	columnHelper.accessor("default_duration_months", {
		id: "default_duration_months",
		header: "Duration (Months)",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => {
			const duration = row.getValue<number>("default_duration_months");
			return <div className="text-sm">{duration || "—"}</div>;
		},
	}),
	columnHelper.accessor("is_active", {
		id: "is_active",
		header: "Status",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => {
			const isActive = row.getValue<boolean>("is_active");
			return <StatusBadge>{isActive ? "Active" : "Inactive"}</StatusBadge>;
		},
	}),
];

// Filter configuration using universal column helper
const universalColumnHelper = createUniversalColumnHelper<ProductRow>();

const productFilterConfig = [
	universalColumnHelper
		.text("name")
		.displayName("Name")
		.icon(PackageIcon)
		.build(),
	universalColumnHelper
		.text("description")
		.displayName("Description")
		.icon(TagIcon)
		.build(),
	universalColumnHelper
		.number("default_duration_months")
		.displayName("Duration (Months)")
		.icon(CalendarIcon)
		.build(),
	universalColumnHelper
		.option("is_active")
		.displayName("Status")
		.icon(TagIcon)
		.build(),
];

function ProductsTableContent({
	filters,
	setFilters,
}: {
	filters: any;
	setFilters: any;
}) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [productToDelete, setProductToDelete] = useState<ProductRow | null>(
		null,
	);
	const [currentPage, setCurrentPage] = useState(0);
	const [sorting, setSorting] = useState<any[]>([]);

	// Reset to first page when filters change
	useEffect(() => {
		setCurrentPage(0);
	}, [filters]);

	// Fetch products data with faceted data in single optimized call
	const {
		data: productsWithFaceted,
		isLoading,
		isError,
		error,
	} = useProductsWithFaceted(
		filters,
		currentPage,
		25,
		sorting,
		["is_active"], // columns to get faceted data for
	);

	// Extract data from combined result
	const productsData = productsWithFaceted
		? {
				data: productsWithFaceted.products,
				count: productsWithFaceted.totalCount,
			}
		: { data: [], count: 0 };

	const isActiveFaceted = productsWithFaceted?.facetedData?.is_active;

	// Create dynamic filter config with proper types based on database schema
	const dynamicFilterConfig = [
		universalColumnHelper
			.text("name")
			.displayName("Name")
			.icon(PackageIcon)
			.build(),
		universalColumnHelper
			.text("description")
			.displayName("Description")
			.icon(TagIcon)
			.build(),
		universalColumnHelper
			.number("default_duration_months")
			.displayName("Duration (Months)")
			.icon(CalendarIcon)
			.build(),
		{
			...universalColumnHelper
				.option("is_active")
				.displayName("Status")
				.icon(TagIcon)
				.build(),
			options: [
				{ value: "true", label: "Active" },
				{ value: "false", label: "Inactive" },
			],
		},
	];

	const rowActions = [
		{
			label: "View Details",
			icon: EyeIcon,
			onClick: (product: ProductRow) => {
				router.push(`/dashboard/system-config/products/${product.id}`);
			},
		},
		{
			label: "Delete",
			icon: TrashIcon,
			variant: "destructive" as const,
			onClick: (product: ProductRow) => {
				setProductToDelete(product);
			},
		},
	];

	const { table, filterColumns, filterState, actions, strategy, totalCount } =
		useUniversalTable<ProductRow>({
			data: productsData?.data || [],
			totalCount: productsData?.count || 0,
			columns: productTableColumns,
			columnsConfig: dynamicFilterConfig,
			filters,
			onFiltersChange: setFilters,
			faceted: { is_active: isActiveFaceted },
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
						Error loading products: {error?.message}
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
					numCols={productTableColumns.length}
					numRows={10}
				/>
			) : (
				<UniversalDataTable
					table={table}
					actions={actions}
					totalCount={totalCount}
					rowActions={rowActions}
					emptyStateMessage="No products found matching your filters"
					emptyStateAction={
						<Button size="sm" className="gap-2" asChild>
							<Link href="#">
								<PlusIcon className="h-4 w-4" />
								Add Product
							</Link>
						</Button>
					}
				/>
			)}

			{productToDelete && (
				<ProductDeleteModal
					product={productToDelete}
					open={!!productToDelete}
					onOpenChange={(open) => !open && setProductToDelete(null)}
					onConfirm={async () => {
						const productId = productToDelete.id;
						const productName = productToDelete.name;

						if (!productId) {
							toast.error("Product ID is missing");
							throw new Error("Product ID is missing");
						}

						try {
							await deleteProduct({ id: productId });
							setProductToDelete(null);
						} catch (error) {
							// Show error toast
							toast.error(`Failed to delete ${productName}. Please try again.`);
							throw error;
						}
					}}
				/>
			)}
		</div>
	);
}

export function ProductsDataTable() {
	return (
		<UniversalDataTableWrapper<ProductRow>
			table="products"
			columns={productTableColumns}
			columnsConfig={productFilterConfig}
			urlStateKey="productFilters"
		>
			{(state) => <ProductsTableContent {...state} />}
		</UniversalDataTableWrapper>
	);
}
