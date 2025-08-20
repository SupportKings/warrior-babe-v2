'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable
} from '@tanstack/react-table'
import { createClient } from '@/utils/supabase/client'
import { useDataTableFilters } from '@/components/data-table-filter'
import { buildSupabaseQuery, buildFacetedCountQuery } from '../utils/query-builder'
import type {
	UniversalTableRow,
	UniversalTableConfig,
	FacetedData
} from '../types'
import type { FiltersState } from '@/components/data-table-filter/core/types'

interface UseUniversalTableProps<T extends UniversalTableRow> extends UniversalTableConfig<T> {
	filters: FiltersState
	onFiltersChange: React.Dispatch<React.SetStateAction<FiltersState>>
}

export function useUniversalTable<T extends UniversalTableRow>({
	table,
	supabaseSchema = 'public',
	columns,
	columnsConfig,
	relationships,
	searchColumns,
	facetedColumns,
	filters,
	onFiltersChange,
	enableSelection = false,
	pageSize = 25,
	serverSide = true
}: UseUniversalTableProps<T>) {
	const supabase = createClient()
	const [rowSelection, setRowSelection] = useState({})
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize })
	
	// Fetch main data
	const dataQuery = useQuery({
		queryKey: [table, 'data', filters, pagination.pageIndex, pagination.pageSize],
		queryFn: async () => {
			if (!serverSide) return { data: [], count: 0 }

			// Extract search term from filters (assuming there's a global search filter)
			const searchFilter = filters.find(f => f.columnId === '__global_search__')
			const searchTerm = searchFilter?.values?.[0] || undefined

			const query = buildSupabaseQuery(supabase, {
				table,
				schema: supabaseSchema as string,
				filters: filters.filter(f => f.columnId !== '__global_search__'), // Remove global search from filters
				searchTerm,
				searchColumns,
				relationships,
				page: pagination.pageIndex,
				pageSize: pagination.pageSize,
				sorting: [{ column: 'created_at', direction: 'desc' }] // Default sorting
			})

			const { data, error, count } = await query as any
			if (error) throw error
			return { data: data as T[], count: count || 0 }
		},
		enabled: serverSide
	})

	// Fetch faceted data for filters
	const facetedQueries = facetedColumns?.map(columnId => 
		useQuery({
			queryKey: [table, 'faceted', columnId, filters],
			queryFn: async () => {
				const query = buildFacetedCountQuery(supabase, table, columnId, filters)
				const { data, error } = await query as any
				if (error) throw error

				// Convert to Map format expected by data-table-filter
				const facetedMap = new Map<string, number>()
				data?.forEach((item: any) => {
					const value = item[columnId]
					if (value) {
						facetedMap.set(String(value), 1) // Simplified count for now
					}
				})
				return facetedMap
			},
			enabled: serverSide
		})
	) || []

	// Create faceted data object
	const facetedData: FacetedData = {}
	facetedColumns?.forEach((columnId, index) => {
		const query = facetedQueries[index]
		if (query.data) {
			facetedData[columnId] = query.data
		}
	})

	// Use the existing data table filters hook
	const { 
		columns: filterColumns, 
		filters: filterState, 
		actions, 
		strategy 
	} = useDataTableFilters({
		strategy: serverSide ? 'server' : 'client',
		data: dataQuery.data?.data || [],
		columnsConfig,
		filters,
		onFiltersChange,
		faceted: facetedData as any
	})

	// Reset pagination when filters change
	const [previousFilters, setPreviousFilters] = useState(filters)
	if (JSON.stringify(previousFilters) !== JSON.stringify(filters)) {
		setPreviousFilters(filters)
		setPagination(prev => ({ ...prev, pageIndex: 0 }))
	}

	// Create TanStack table instance
	const tableInstance = useReactTable({
		data: dataQuery.data?.data || [],
		columns,
		getRowId: (row: T) => row.id || String(Math.random()),
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onRowSelectionChange: enableSelection ? setRowSelection : undefined,
		onPaginationChange: setPagination, // Connect pagination state
		manualPagination: serverSide, // Enable manual pagination for server-side
		pageCount: serverSide ? Math.ceil((dataQuery.data?.count || 0) / pagination.pageSize) : -1,
		state: {
			pagination,
			rowSelection: enableSelection ? rowSelection : {}
		}
	})

	return {
		// Table instance for rendering
		table: tableInstance,
		
		// Filter components
		filterColumns,
		filterState,
		actions,
		strategy,
		
		// Loading states
		isLoading: dataQuery.isLoading,
		isError: dataQuery.isError,
		error: dataQuery.error,
		
		// Data
		data: dataQuery.data?.data || [],
		
		// Pagination (server-side)
		totalCount: dataQuery.data?.count || 0,
		pageCount: Math.ceil((dataQuery.data?.count || 0) / pageSize)
	}
}