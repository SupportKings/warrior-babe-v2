'use client'

import { DataTableFilter } from '@/components/data-table-filter'
import { UniversalDataTable } from '@/components/universal-data-table/universal-data-table'
import { UniversalDataTableWrapper } from '@/components/universal-data-table/universal-data-table-wrapper'
import { useUniversalTable } from '@/components/universal-data-table/hooks/use-universal-table'
import { createUniversalColumnHelper } from '@/components/universal-data-table/utils/column-helpers'
import { UniversalTableSkeleton, UniversalTableFilterSkeleton } from '@/components/universal-data-table/table-skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createColumnHelper } from '@tanstack/react-table'
import { format } from 'date-fns'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { ClientDeleteModal } from './client-delete-modal'
import { deleteClient } from '../actions/deleteClient'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'
import {
	UserIcon,
	CalendarIcon,
	TagIcon,
	MailIcon,
	PlusIcon,
	PackageIcon,
	EditIcon,
	TrashIcon,
	EyeIcon
} from 'lucide-react'
import type { Database } from '@/utils/supabase/database.types'

// Type for client row from Supabase with product relation
type ClientRow = Database['public']['Tables']['clients']['Row'] & {
	product?: Database['public']['Tables']['products']['Row']
}

// Create column helper for TanStack table
const columnHelper = createColumnHelper<ClientRow>()

// TanStack table column definitions
const clientTableColumns = [
	columnHelper.display({
		id: 'select',
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && 'indeterminate')
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
	columnHelper.accessor('first_name', {
		id: 'first_name',
		header: 'Name',
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => {
			const firstName = row.getValue<string>('first_name')
			const lastName = row.original.last_name
			return <div className="font-medium">{firstName} {lastName}</div>
		},
	}),
	columnHelper.accessor('email', {
		id: 'email', 
		header: 'Email',
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('email')}</div>,
	}),
	columnHelper.display({
		id: 'product',
		header: 'Product',
		enableColumnFilter: true,
		cell: ({ row }) => {
			const product = row.original.product
			return (
				<div className="text-sm">
					{product?.name || 'No product assigned'}
				</div>
			)
		},
	}),
	columnHelper.accessor('status', {
		id: 'status',
		header: 'Status',
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => {
			const status = row.getValue<string>('status')
			return (
				<Badge variant={status === 'active' ? 'default' : 'secondary'}>
					{status}
				</Badge>
			)
		},
	}),
	columnHelper.accessor('start_date', {
		id: 'start_date',
		header: 'Joined',
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => {
			const date = row.getValue<string>('start_date')
			if (!date) return null
			return format(new Date(date), 'MMM dd, yyyy')
		},
	}),
]

// Filter configuration using universal column helper
const universalColumnHelper = createUniversalColumnHelper<ClientRow>()

const clientFilterConfig = [
	universalColumnHelper
		.text('first_name')
		.displayName('First Name')
		.icon(UserIcon)
		.build(),
	universalColumnHelper
		.text('email')
		.displayName('Email') 
		.icon(MailIcon)
		.build(),
	universalColumnHelper
		.option('product_id')
		.displayName('Product')
		.icon(PackageIcon)
		.build(),
	universalColumnHelper
		.option('status')
		.displayName('Status')
		.icon(TagIcon)
		.build(),
	universalColumnHelper
		.date('start_date')
		.displayName('Joined Date')
		.icon(CalendarIcon)
		.build(),
]

function ClientsTableContent({ filters, setFilters }: {
	filters: any
	setFilters: any
}) {
	const supabase = createClient()
	const queryClient = useQueryClient()
	const [clientToDelete, setClientToDelete] = useState<ClientRow | null>(null)
	
	const { execute: executeDelete } = useAction(deleteClient, {
		onSuccess: () => {
			// Invalidate and refetch the clients data
			queryClient.invalidateQueries({ queryKey: ['clients'] })
			setClientToDelete(null)
		},
		onError: ({ error }) => {
			console.error('Error deleting client:', error)
		}
	})
	
	// Fetch products for filter options
	const { data: products, isPending: isProductsPending } = useQuery({
		queryKey: ['products'],
		queryFn: async () => {
			const { data, error } = await supabase
				.from('products')
				.select('id, name')
				.eq('is_active', true)
				.order('name')
			if (error) throw error
			return data
		}
	})
	
	// Create dynamic filter config with proper types based on database schema
	const dynamicFilterConfig = [
		universalColumnHelper
			.text('first_name')
			.displayName('First Name')
			.icon(UserIcon)
			.build(),
		universalColumnHelper
			.text('email')
			.displayName('Email') 
			.icon(MailIcon)
			.build(),
		{
			...universalColumnHelper
				.option('product_id')
				.displayName('Product')
				.icon(PackageIcon)
				.build(),
			options: products?.map(product => ({
				value: product.id,
				label: product.name
			})) || []
		},
		universalColumnHelper
			.text('status')  // Status is string | null, so use text filter
			.displayName('Status')
			.icon(TagIcon)
			.build(),
		universalColumnHelper
			.date('start_date')
			.displayName('Joined Date')
			.icon(CalendarIcon)
			.build(),
	]
	const {
		table,
		filterColumns,
		filterState,
		actions,
		strategy,
		isLoading,
		isError,
		error,
		totalCount,
		rowActions
	} = useUniversalTable<ClientRow>({
		table: 'clients',
		columns: clientTableColumns,
		columnsConfig: dynamicFilterConfig,
		relationships: {
			product: {
				table: 'products',
				column: 'product_id',
				type: 'single'
			}
		},
		filters,
		onFiltersChange: setFilters,
		searchColumns: ['first_name', 'last_name', 'email', 'status'],
		facetedColumns: ['product_id'],
		enableSelection: true,
		pageSize: 25,
		serverSide: true,
		rowActions: [
			{
				label: 'View Details',
				icon: EyeIcon,
				onClick: (client) => {
					console.log('View client:', client)
				}
			},
			{
				label: 'Edit',
				icon: EditIcon,
				onClick: (client) => {
					console.log('Edit client:', client)
				}
			},
			{
				label: 'Delete',
				icon: TrashIcon,
				variant: 'destructive',
				onClick: (client) => {
					setClientToDelete(client)
				},
				disabled: (client) => client.status === 'active'
			}
		]
	})

	// Check if filter options are still loading
	const isFilterDataPending = isProductsPending

	if (isError) {
		return (
			<div className="w-full">
				<div className="text-center space-y-2">
					<p className="text-red-600">Error loading clients: {error?.message}</p>
					<p className="text-sm text-muted-foreground">
						Please check your database connection and try again.
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className="w-full">
			<div className="flex items-center pb-4 gap-2">
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
				<UniversalTableSkeleton numCols={clientTableColumns.length} numRows={10} />
			) : (
				<UniversalDataTable
					table={table}
					actions={actions}
					totalCount={totalCount}
					rowActions={rowActions}
					emptyStateMessage="No clients found matching your filters"
					emptyStateAction={
						<Button size="sm" className="gap-2">
							<PlusIcon className="w-4 h-4" />
							Add Client
						</Button>
					}
				/>
			)}
			
			{clientToDelete && (
				<ClientDeleteModal
					client={clientToDelete}
					open={!!clientToDelete}
					onOpenChange={(open) => !open && setClientToDelete(null)}
					onConfirm={async () => {
						const clientId = clientToDelete.id
						const clientName = `${clientToDelete.first_name} ${clientToDelete.last_name}`
						
						if (!clientId) {
							toast.error('Client ID is missing')
							throw new Error('Client ID is missing')
						}
						
						try {
							await deleteClient({ id: clientId })
							
							// Refresh the table after successful deletion
							queryClient.invalidateQueries({ queryKey: ['clients'] })
							setClientToDelete(null)
							
							// Show success toast
							toast.success(`${clientName} has been deleted successfully`)
						} catch (error) {
							// Show error toast
							toast.error(`Failed to delete ${clientName}. Please try again.`)
							throw error
						}
					}}
				/>
			)}
		</div>
	)
}

export function ClientsDataTable() {
	return (
		<UniversalDataTableWrapper<ClientRow>
			table="clients"
			columns={clientTableColumns}
			columnsConfig={clientFilterConfig}
			urlStateKey="clientFilters"
		>
			{(state) => <ClientsTableContent {...state} />}
		</UniversalDataTableWrapper>
	)
}