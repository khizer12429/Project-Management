import { cn } from '@/lib/cn'

const selectClassName = cn(
  'h-11 w-full appearance-none rounded-lg border border-border bg-surface px-3.5 pr-10 text-sm text-ink',
  'outline-none transition-[border-color,box-shadow] duration-150',
  'focus:border-stat-orange/40 focus:ring-2 focus:ring-stat-orange/10',
)

export function Select({ label, error, id, children, className, ...props }) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-ink" htmlFor={selectId}>
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            selectClassName,
            error && 'border-danger focus:border-danger focus:ring-danger/10',
            className,
          )}
          aria-invalid={Boolean(error)}
          {...props}
        >
          {children}
        </select>
        <span
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted"
          aria-hidden="true"
        >
          <svg viewBox="0 0 20 20" className="size-4" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>
      {error && (
        <p className="m-0 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
