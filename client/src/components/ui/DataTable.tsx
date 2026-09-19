import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Inbox, TriangleAlert } from 'lucide-react'
import { Button, SkeletonRows } from './primitives'
import { cn } from '../../utils/format'

export type Column<T> = {
  key: string
  header: string
  render?: (row: T) => ReactNode
  /** Hidden on small screens where space is tight. */
  hideOnMobile?: boolean
  className?: string
}

export function EmptyState({ title, message, action, icon }: { title: string; message?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-[#e5e9dd] text-forest" aria-hidden="true">{icon ?? <Inbox size={22} />}</span>
      <p className="font-display text-xl">{title}</p>
      {message && <p className="max-w-sm text-sm text-[#69736c]">{message}</p>}
      {action}
    </div>
  )
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }: { title?: string; message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-14 text-center" role="alert">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-[#f6dcda] text-[#a3231c]" aria-hidden="true"><TriangleAlert size={22} /></span>
      <p className="font-display text-xl">{title}</p>
      {message && <p className="max-w-sm text-sm text-[#69736c]">{message}</p>}
      {onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>Try again</Button>}
    </div>
  )
}

export function Pagination({ page, totalPages, total, onChange }: { page: number; totalPages: number; total?: number; onChange: (page: number) => void }) {
  if (totalPages <= 1) return null
  return (
    <nav className="mt-4 flex items-center justify-between gap-3" aria-label="Pagination">
      <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)} icon={<ChevronLeft size={14} />}>Previous</Button>
      <p className="text-xs text-[#69736c]" aria-live="polite">
        Page {page} of {totalPages}{typeof total === 'number' ? ` · ${total} record${total === 1 ? '' : 's'}` : ''}
      </p>
      <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Next <ChevronRight size={14} /></Button>
    </nav>
  )
}

/**
 * Table on wide screens, stacked cards below `md` (spec section 41: mobile
 * layouts are a different layout, not a shrunken desktop one).
 */
export function DataTable<T extends { _id?: string; id?: string }>({
  columns, rows, loading, error, onRetry, emptyTitle = 'Nothing here yet', emptyMessage, emptyAction, actions, caption,
}: {
  columns: Column<T>[]
  rows: T[]
  loading?: boolean
  error?: boolean
  onRetry?: () => void
  emptyTitle?: string
  emptyMessage?: string
  emptyAction?: ReactNode
  actions?: (row: T) => ReactNode
  caption?: string
}) {
  const columnCount = columns.length + (actions ? 1 : 0)
  const keyOf = (row: T, index: number) => row._id ?? row.id ?? String(index)

  if (error) {
    return <div className="border border-[#d8d9d0] bg-white"><ErrorState message="We could not load this list." onRetry={onRetry} /></div>
  }

  if (!loading && rows.length === 0) {
    return <div className="border border-[#d8d9d0] bg-white"><EmptyState title={emptyTitle} message={emptyMessage} action={emptyAction} /></div>
  }

  return (
    <>
      {/* Wide screens */}
      <div className="hidden overflow-x-auto border border-[#d8d9d0] bg-white md:block">
        <table className="min-w-full text-left text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead className="bg-[#e5e9dd] text-[#69736c]">
            <tr>
              {columns.map((column) => <th key={column.key} scope="col" className={cn('px-4 py-3 font-medium', column.className)}>{column.header}</th>)}
              {actions && <th scope="col" className="px-4 py-3 font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d8d9d0]">
            {loading
              ? <SkeletonRows rows={5} columns={columnCount} />
              : rows.map((row, index) => (
                <tr key={keyOf(row, index)}>
                  {columns.map((column) => (
                    <td key={column.key} className={cn('px-4 py-3', column.className)}>
                      {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? '--')}
                    </td>
                  ))}
                  {actions && <td className="px-4 py-3"><div className="flex items-center gap-1">{actions(row)}</div></td>}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Small screens */}
      <div className="grid gap-3 md:hidden">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-2xl bg-[#e5e9dd]" />)
          : rows.map((row, index) => (
            <article key={keyOf(row, index)} className="border border-[#d8d9d0] bg-white p-4">
              <dl className="grid gap-2">
                {columns.filter((column) => !column.hideOnMobile).map((column) => (
                  <div key={column.key} className="flex items-start justify-between gap-4">
                    <dt className="text-xs uppercase tracking-wider text-[#69736c]">{column.header}</dt>
                    <dd className="text-right text-sm">{column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? '--')}</dd>
                  </div>
                ))}
              </dl>
              {actions && <div className="mt-3 flex flex-wrap gap-2 border-t border-[#d8d9d0] pt-3">{actions(row)}</div>}
            </article>
          ))}
      </div>
    </>
  )
}
