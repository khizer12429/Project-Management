import { useState } from 'react'
import { cn } from '@/lib/cn'
import { Pagination } from '@/components/ui/Pagination'
import { PAGE_SIZE } from '@/lib/constants'

export function Modal({ open, title, onClose, children, wide = false }) {
  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="absolute inset-0 bg-black/40"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-10 max-h-[90dvh] w-full overflow-y-auto rounded-xl bg-surface p-4 shadow-xl sm:p-6',
          wide ? 'max-w-2xl' : 'max-w-lg',
        )}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="modal-title" className="m-0 text-xl font-semibold text-ink">
            {title}
          </h2>
          <button
            type="button"
            className="cursor-pointer border-0 bg-transparent text-2xl leading-none text-muted"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Table({
  columns,
  rows,
  emptyMessage = 'No records found.',
  pageSize = PAGE_SIZE,
}) {
  const [page, setPage] = useState(1)
  const totalItems = rows.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const paginatedRows = rows.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full min-w-150 border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-sidebar">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn('px-4 py-3 font-semibold text-ink', column.className)}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            paginatedRows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0">
                {columns.map((column) => (
                  <td key={column.key} className={cn('px-4 py-3', column.className)}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </div>
  )
}
