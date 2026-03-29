import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  createColumnHelper,
  type ColumnDef,
  useReactTable,
  flexRender,
  getCoreRowModel,
  type RowSelectionState,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

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

export interface DataTableColumn<TData> {
  header: string;
  accessorKey: string;
  cell?: (row: TData) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

type DataTableColumnMeta = {
  headerClassName?: string;
  cellClassName?: string;
};

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

function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) {
    return false;
  }

  const aSorted = [...a].sort();
  const bSorted = [...b].sort();

  return aSorted.every((value, index) => value === bSorted[index]);
}

function mapsEqual(a: RowSelectionState, b: RowSelectionState) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  return aKeys.every((key) => Boolean(a[key]) === Boolean(b[key]));
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
  const hasRowSelection = Boolean(rowSelection);
  const hasRowActions = Boolean(rowActions);

  const rowKeys = useMemo(
    () => data.map((row, rowIndex) => (rowKey ? rowKey(row, rowIndex) : String(rowIndex))),
    [data, rowKey]
  );

  const selectedKeySet = useMemo(
    () => new Set(rowSelection?.selectedKeys ?? []),
    [rowSelection?.selectedKeys]
  );

  const [tableRowSelection, setTableRowSelection] = useState<RowSelectionState>({});

  useEffect(() => {
    if (!hasRowSelection) {
      return;
    }

    const nextSelection: RowSelectionState = {};

    rowKeys.forEach((key) => {
      if (selectedKeySet.has(key)) {
        nextSelection[key] = true;
      }
    });

    setTableRowSelection((prev) => (mapsEqual(prev, nextSelection) ? prev : nextSelection));
  }, [hasRowSelection, rowKeys, selectedKeySet]);

  const columnHelper = useMemo(() => createColumnHelper<TData>(), []);

  const baseColumns = useMemo<ColumnDef<TData, unknown>[]>(
    () =>
      columns.map((column) =>
        columnHelper.accessor((row) => (row as Record<string, unknown>)[column.accessorKey], {
          id: column.accessorKey,
          header: () => column.header,
          cell: ({ row, getValue }) => {
            if (column.cell) {
              return column.cell(row.original);
            }

            const value = getValue();
            return value == null ? '-' : String(value);
          },
          meta: {
            headerClassName: column.headerClassName,
            cellClassName: column.cellClassName,
          },
        })
      ),
    [columnHelper, columns]
  );

  const columnsWithFeatures = useMemo<ColumnDef<TData, unknown>[]>(() => {
    const nextColumns = [...baseColumns];

    if (hasRowActions) {
      nextColumns.push(
        columnHelper.display({
          id: 'actions',
          header: () => actionsHeader,
          cell: ({ row }) => rowActions?.(row.original),
        })
      );
    }

    if (!hasRowSelection) {
      return nextColumns;
    }

    const selectionColumn: ColumnDef<TData, unknown> = {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
          aria-label="Select all rows"
          className="border-slate-400 data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500 data-[state=indeterminate]:border-emerald-500 data-[state=indeterminate]:bg-emerald-500"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
          aria-label="Select row"
          className="border-slate-400 data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500 data-[state=indeterminate]:border-emerald-500 data-[state=indeterminate]:bg-emerald-500"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      meta: { headerClassName: 'w-10', cellClassName: 'w-10' },
    };

    return [selectionColumn, ...nextColumns];
  }, [actionsHeader, baseColumns, columnHelper, hasRowActions, hasRowSelection, rowActions]);

  const table = useReactTable({
    data,
    columns: columnsWithFeatures,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row, index) => (rowKey ? rowKey(row, index) : String(index)),
    onRowSelectionChange: setTableRowSelection,
    state: {
      rowSelection: tableRowSelection,
    },
  });

  useEffect(() => {
    if (!rowSelection || !hasRowSelection) {
      return;
    }

    const visibleSet = new Set(rowKeys);
    const selectedVisible = rowKeys.filter((key) => Boolean(tableRowSelection[key]));
    const preserved = rowSelection.selectedKeys.filter((key) => !visibleSet.has(key));
    const next = Array.from(new Set([...preserved, ...selectedVisible]));

    if (!arraysEqual(next, rowSelection.selectedKeys)) {
      rowSelection.onSelectedKeysChange(next);
    }
  }, [hasRowSelection, rowKeys, rowSelection, tableRowSelection]);

  const selectedCount = rowSelection?.selectedKeys.length ?? 0;

  const rangeStart =
    pagination && pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const rangeEnd = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0;

  return (
    <div className={cn('w-full', className)}>
      {filters ? <div className="my-4 border-b px-4 pb-3">{filters}</div> : null}

      <AnimatePresence initial={false}>
        {hasRowSelection && selectedCount > 0 ? (
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
              <span className="font-semibold">{`${selectedCount} selected`}</span>
              {selectionActions}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="w-full overflow-x-auto">
        <Table className={cn('min-w-[780px] border-collapse', tableClassName)}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as DataTableColumnMeta | undefined;
                  return (
                    <TableHead
                      key={header.id}
                      className={cn('px-2 sm:px-3', meta?.headerClassName)}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading
              ? Array.from({ length: loadingRows }).map((_, rowIndex) => (
                  <TableRow key={`skeleton-row-${rowIndex}`}>
                    {Array.from({ length: columnsWithFeatures.length }).map((__, cellIndex) => (
                      <TableCell
                        key={`skeleton-cell-${rowIndex}-${cellIndex}`}
                        className="px-2 sm:px-3"
                      >
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : null}

            {!loading && table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columnsWithFeatures.length}
                  className="px-3 py-6 text-center text-sm text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : null}

            {!loading
              ? table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() ? 'selected' : undefined}>
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta as DataTableColumnMeta | undefined;
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn('px-2 sm:px-3', meta?.cellClassName)}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
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
                value={String(pagination.limit)}
                onValueChange={(value) => pagination.onLimitChange(Number(value))}
              >
                <SelectTrigger
                  id="datatable-limit"
                  className="h-8 w-[72px] px-2 text-xs sm:h-9 sm:text-sm"
                >
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
