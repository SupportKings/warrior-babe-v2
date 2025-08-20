import type { DataTableFilterActions } from '@/components/data-table-filter/core/types'
import { flexRender, type Table as TanStackTable } from '@tanstack/react-table'
import { XIcon } from 'lucide-react'
import { EmptyTableIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { UniversalTableRow } from './types'

interface UniversalDataTableProps<T extends UniversalTableRow = UniversalTableRow> {
	table: TanStackTable<T>
	actions?: DataTableFilterActions
	emptyStateMessage?: string
	emptyStateAction?: React.ReactNode
	totalCount?: number
	serverSide?: boolean
}

export function UniversalDataTable<T extends UniversalTableRow>({
	table,
	actions,
	emptyStateMessage = "No data found matching your filters.",
	emptyStateAction,
	totalCount
}: UniversalDataTableProps<T>) {
	return (
		<>
			{/* Pagination at top */}
			<div className="flex items-center justify-between py-4">
				<div className="flex-1 text-sm text-muted-foreground tabular-nums">
					{table.getFilteredSelectedRowModel().rows.length} of{' '}
					{table.getRowModel().rows.length} row(s) selected.{' '}
					<span className="text-primary font-medium">
						Total: {totalCount || 0} • Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
					</span>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.setPageIndex(0)}
						disabled={!table.getCanPreviousPage()}
					>
						First
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Next
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.setPageIndex(table.getPageCount() - 1)}
						disabled={!table.getCanNextPage()}
					>
						Last
					</Button>
				</div>
			</div>
			
			{/* Table */}
			<div className="rounded-md border bg-white dark:bg-inherit">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
										</TableHead>
									)
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && 'selected'}
									className="h-12"
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell className="h-12" key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow className="hover:bg-transparent">
								<TableCell
									colSpan={table.getAllColumns().length}
									className="h-[calc(var(--spacing)*12*10)]"
								>
									<div className="flex flex-col items-center justify-center gap-8">
										<EmptyTableIcon className="size-24 stroke-muted-foreground" />
										<div className="flex flex-col gap-4 text-center font-[450]">
											<span>{emptyStateMessage}</span>
											<div className="flex items-center gap-2">
												{emptyStateAction ? (
													<div className="flex flex-col items-center gap-2">
														<span className="text-muted-foreground">
															Adjust or clear filters to reveal data.
														</span>
														<div className="flex items-center gap-2">
															<Button
																variant="ghost"
																size="sm"
																className={cn('gap-1', !actions && 'hidden')}
																onClick={actions?.removeAllFilters}
															>
																<XIcon className="text-muted-foreground" />
																Clear filters
															</Button>
															{emptyStateAction}
														</div>
													</div>
												) : (
													<div className="flex items-center gap-2">
														<span className="text-muted-foreground">
															Adjust or clear filters to reveal data.
														</span>
														<Button
															variant="ghost"
															size="sm"
															className={cn('gap-1', !actions && 'hidden')}
															onClick={actions?.removeAllFilters}
														>
															<XIcon className="text-muted-foreground" />
															Clear filters
														</Button>
													</div>
												)}
											</div>
										</div>
									</div>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</>
	)
}