import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CheckedState } from '@radix-ui/react-checkbox';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface DataTableColumn<TData> {
  header: string;
  accessorKey: string;
  cell?: (row: TData) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

export interface DataTablePagination {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  limitOptions?: number[];
}

export interface DataTableRowSelection {
  selectedKeys: string[];
  onSelectedKeysChange: (keys: string[]) => void;
}

interface DataTableProps<TData> {
  columns: DataTableColumn<TData>[];
  data: TData[];
  loading?: boolean;
  rowKey?: (row: TData, index: number) => string;
  loadingRows?: number;
  emptyMessage?: string;
  filters?: ReactNode;
  pagination?: DataTablePagination;
  rowActions?: (row: TData) => ReactNode;
  actionsHeader?: string;
  rowSelection?: DataTableRowSelection;
  selectionActions?: ReactNode;
  className?: string;
  tableClassName?: string;
}

interface TableCheckboxProps {
  checked: CheckedState;
  onChange: (checked: boolean) => void;
  ariaLabel: string;
  disabled?: boolean;
}

function TableCheckbox({ checked, onChange, ariaLabel, disabled = false }: TableCheckboxProps) {
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={(value) => onChange(value === true)}
      aria-label={ariaLabel}
      disabled={disabled}
      className="border-slate-400 data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500 data-[state=indeterminate]:border-emerald-500 data-[state=indeterminate]:bg-emerald-500"
    />
  );
}

export function DataTable<TData>({
  columns,
  data,
  loading = false,
  rowKey,
  loadingRows = 10,
  emptyMessage = 'No records found.',
  filters,
  pagination,
  rowActions,
  actionsHeader = 'Actions',
  rowSelection,
  selectionActions,
  className,
  tableClassName,
}: DataTableProps<TData>) {
  const hasActions = Boolean(rowActions);
  const hasRowSelection = Boolean(rowSelection);

  const rowKeys = useMemo(
    () => data.map((row, rowIndex) => (rowKey ? rowKey(row, rowIndex) : String(rowIndex))),
    [data, rowKey]
  );

  const selectedKeySet = useMemo(
    () => new Set(rowSelection?.selectedKeys ?? []),
    [rowSelection?.selectedKeys]
  );

  const selectedVisibleCount = rowKeys.filter((key) => selectedKeySet.has(key)).length;
  const isAllVisibleSelected = rowKeys.length > 0 && selectedVisibleCount === rowKeys.length;
  const isPartiallySelected = selectedVisibleCount > 0 && selectedVisibleCount < rowKeys.length;

  const totalColumns = columns.length + (hasActions ? 1 : 0) + (hasRowSelection ? 1 : 0);

  const rangeStart =
    pagination && pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const rangeEnd = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0;

  return (
    <div className={cn('w-full', className)}>
      {filters ? <div className="my-4 border-b px-4 pb-3">{filters}</div> : null}

      <AnimatePresence initial={false}>
        {hasRowSelection && selectedKeySet.size > 0 ? (
          <motion.div
            key="datatable-selection-bar"
            layout
            initial={{ opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="mb-0 flex items-center justify-between bg-emerald-100 px-2 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 sm:px-3">
              <span className="flex items-center font-semibold">
                <span className="flex w-10 items-center px-2 sm:px-3">
                  <TableCheckbox checked={true} onChange={() => undefined} ariaLabel="Selected rows" disabled />
                </span>
                <span>{selectedKeySet.size} selected</span>
              </span>
              {selectionActions}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="w-full overflow-x-auto">
        <Table className={cn('min-w-[780px] border-collapse', tableClassName)}>
          <TableHeader>
            <TableRow>
              {hasRowSelection ? (
                <TableHead className="w-10 px-2 sm:px-3">
                  <TableCheckbox
                    checked={isAllVisibleSelected ? true : isPartiallySelected ? 'indeterminate' : false}
                    onChange={(checked) => {
                      if (!rowSelection) {
                        return;
                      }

                      if (checked) {
                        const merged = new Set([...rowSelection.selectedKeys, ...rowKeys]);
                        rowSelection.onSelectedKeysChange(Array.from(merged));
                        return;
                      }

                      const visibleSet = new Set(rowKeys);
                      rowSelection.onSelectedKeysChange(
                        rowSelection.selectedKeys.filter((key) => !visibleSet.has(key))
                      );
                    }}
                    ariaLabel="Select all rows"
                  />
                </TableHead>
              ) : null}
              {columns.map((column) => (
                <TableHead
                  key={column.accessorKey}
                  className={cn('px-2 sm:px-3', column.headerClassName)}
                >
                  {column.header}
                </TableHead>
              ))}
              {hasActions ? <TableHead className="px-2 sm:px-3">{actionsHeader}</TableHead> : null}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading
              ? Array.from({ length: loadingRows }).map((_, rowIndex) => (
                  <TableRow key={`skeleton-row-${rowIndex}`}>
                    {hasRowSelection ? (
                      <TableCell className="px-2 sm:px-3">
                        <Skeleton className="h-4 w-4 rounded-sm" />
                      </TableCell>
                    ) : null}
                    {columns.map((column) => (
                      <TableCell
                        key={`${column.accessorKey}-skeleton-${rowIndex}`}
                        className="px-2 sm:px-3"
                      >
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                    ))}
                    {hasActions ? (
                      <TableCell className="px-2 sm:px-3">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))
              : null}

            {!loading && data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={totalColumns}
                  className="px-3 py-6 text-center text-sm text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : null}

            {!loading
              ? data.map((row, rowIndex) => {
                  const key = rowKeys[rowIndex];
                  return (
                    <TableRow key={key}>
                      {hasRowSelection ? (
                        <TableCell className="w-10 px-2 sm:px-3">
                          <TableCheckbox
                            checked={selectedKeySet.has(key)}
                            onChange={(checked) => {
                              if (!rowSelection) {
                                return;
                              }

                              if (checked) {
                                rowSelection.onSelectedKeysChange([...rowSelection.selectedKeys, key]);
                                return;
                              }

                              rowSelection.onSelectedKeysChange(
                                rowSelection.selectedKeys.filter((selectedKey) => selectedKey !== key)
                              );
                            }}
                            ariaLabel="Select row"
                          />
                        </TableCell>
                      ) : null}
                      {columns.map((column) => (
                        <TableCell
                          key={`${column.accessorKey}-${key}`}
                          className={cn('px-2 sm:px-3', column.cellClassName)}
                        >
                          {column.cell
                            ? column.cell(row)
                            : String((row as Record<string, unknown>)[column.accessorKey] ?? '-')}
                        </TableCell>
                      ))}
                      {hasActions ? (
                        <TableCell className="px-2 sm:px-3">{rowActions?.(row)}</TableCell>
                      ) : null}
                    </TableRow>
                  );
                })
              : null}
          </TableBody>
        </Table>
      </div>

      {pagination ? (
        <div className="mt-2 border-t px-4 pt-2 sm:px-0">
          <div className="flex flex-wrap items-center justify-end gap-3 text-muted-foreground">
            <div className="flex items-center gap-1 text-xs sm:text-sm">
              <label htmlFor="datatable-limit">Rows per page:</label>
              <Select
                id="datatable-limit"
                value={String(pagination.limit)}
                onValueChange={(value) => pagination.onLimitChange(Number(value))}
              >
                <SelectTrigger className="h-8 w-[72px] px-2 text-xs sm:h-9 sm:text-sm">
                  <SelectValue placeholder={String(pagination.limit)} />
                </SelectTrigger>
                <SelectContent>
                  {(pagination.limitOptions ?? [5, 10, 20, 50]).map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-xs sm:text-sm">
              {rangeStart}-{rangeEnd} of {pagination.total}
            </div>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={loading || pagination.page <= 1}
                onClick={() => pagination.onPageChange(Math.max(pagination.page - 1, 1))}
                aria-label="Previous page"
                title="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={loading || pagination.page * pagination.limit >= pagination.total}
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                aria-label="Next page"
                title="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
