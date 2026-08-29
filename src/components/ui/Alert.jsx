import { cn } from '@/lib/cn'

const variants = {
  error: 'bg-danger-bg text-danger',
  success: 'bg-success-bg text-success',
}

export function Alert({ children, variant = 'error', className }) {
  return (
    <p
      className={cn('m-0 rounded-xl px-3.5 py-3 text-sm', variants[variant], className)}
      role="alert"
    >
      {children}
    </p>
  )
}
