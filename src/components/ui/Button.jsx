import { cn } from '@/lib/cn'

const variants = {
  primary: 'bg-stat-orange text-white hover:enabled:brightness-110',
  ghost: 'border border-border bg-transparent text-ink hover:enabled:bg-sidebar',
  danger: 'bg-danger text-white hover:enabled:brightness-110',
}

export function Button({
  children,
  variant = 'primary',
  isLoading = false,
  fullWidth = false,
  type = 'button',
  disabled,
  className,
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-12 cursor-pointer items-center justify-center gap-2.5 rounded-xl px-4.5 font-medium tracking-[0.01em] transition-[background-color,opacity] duration-150',
        'disabled:cursor-not-allowed disabled:opacity-70',
        variants[variant],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span
          className="size-4 animate-[spin_0.7s_linear_infinite] rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  )
}
