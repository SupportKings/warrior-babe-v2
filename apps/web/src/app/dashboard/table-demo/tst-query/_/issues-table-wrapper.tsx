'use client'

import { parseAsJson, useQueryState } from 'nuqs'
import { z } from 'zod'
import type { FiltersState } from '@/components/data-table-filter/core/types'
import { IssuesTable } from './issues-table'
import QueryClientProvider from './query-client-provider'

const filtersSchema = z.custom<FiltersState>()

export function IssuesTableWrapper() {
  const [filters, setFilters] = useQueryState<FiltersState>(
    'filters',
    parseAsJson(filtersSchema.parse).withDefault([]),
  )

  return (
    <QueryClientProvider>
      <IssuesTable state={{ filters, setFilters }} />
    </QueryClientProvider>
  )
}
