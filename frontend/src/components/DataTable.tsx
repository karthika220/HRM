import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  RowSelectionState,
  SortingState,
  ColumnResizeMode,
  HeaderGroup,
  Header,
  Row,
  Cell,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, ChevronsUpDown, MoreHorizontal, X, Check } from 'lucide-react';

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  onRowClick?: (row: TData) => void;
  isLoading?: boolean;
}

export function DataTable<TData>({ data, columns, onRowClick, isLoading = false }: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getRowId: (row: any) => row.id,
    state: {
      sorting,
      rowSelection,
      globalFilter,
    },
    columnResizeMode: 'onChange' as ColumnResizeMode,
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
  });

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-800 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-lg font-medium">No results</p>
        <p className="text-sm">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      {/* Selection Bar */}
      {selectedRowsCount > 0 && (
        <div className="bg-violet-500/10 border-b border-violet-500/20 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-violet-300">
              {selectedRowsCount} row{selectedRowsCount > 1 ? 's' : ''} selected
            </span>
          </div>
          <button
            onClick={() => table.resetRowSelection()}
            className="text-violet-400 hover:text-violet-300 text-sm flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-gray-950 border-b border-gray-800">
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<any>) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header: Header<any>) => (
                  <th
                    key={header.id}
                    className="relative px-4 py-3 text-left text-xs font-medium text-gray-400 border-r border-gray-800 last:border-r-0"
                    style={{ width: header.getSize() }}
                  >
                    <div className="flex items-center gap-2">
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-1 select-none ${
                            header.column.getCanSort() ? 'cursor-pointer hover:text-gray-300' : ''
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="ml-1">
                              {header.column.getIsSorted() === 'desc' ? (
                                <ChevronDown className="w-3 h-3" />
                              ) : header.column.getIsSorted() === 'asc' ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronsUpDown className="w-3 h-3 opacity-50" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Column Resize Handle */}
                    {header.column.getCanResize() && (
                      <div
                        {...{
                          onMouseDown: header.getResizeHandler(),
                          onTouchStart: header.getResizeHandler(),
                          className: `absolute top-0 right-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-violet-500 transition-colors ${
                            header.column.getIsResizing() ? 'bg-violet-500' : ''
                          }`,
                          style: {
                            transform: header.column.getIsResizing() ? 'scaleX(2)' : 'scaleX(1)',
                          },
                        }}
                      />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row: Row<any>) => (
              <tr
                key={row.id}
                className={`border-b border-gray-800 hover:bg-gray-800/70 transition-colors ${
                  row.getIsSelected() ? 'bg-violet-500/8' : ''
                } ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell: Cell<any>) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 text-sm text-gray-300 border-r border-gray-800 last:border-r-0"
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="border-t border-gray-800 px-4 py-3 flex items-center justify-between bg-gray-950">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <span className="text-gray-600">|</span>
          <span>{table.getFilteredRowModel().rows.length} total rows</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Page Size Selector */}
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded px-2 py-1 outline-none focus:border-violet-500"
          >
            {[5, 8, 10, 20].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>

          {/* Pagination Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="p-1 rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400"
            >
              <ChevronsUpDown className="w-4 h-4 rotate-180" />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1 rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400"
            >
              <ChevronDown className="w-4 h-4 rotate-90" />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1 rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400"
            >
              <ChevronDown className="w-4 h-4 -rotate-90" />
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="p-1 rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400"
            >
              <ChevronsUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
