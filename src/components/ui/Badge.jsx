import { cn } from '@/lib/cn'

const styles = {
  todo: 'bg-stat-beige text-ink',
  in_progress: 'bg-admin-bg text-admin',
  done: 'bg-success-bg text-success',
  low: 'bg-sidebar text-muted',
  medium: 'bg-stat-beige text-ink',
  high: 'bg-danger-bg text-danger',
}

const labels = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export function Badge({ value, type = 'status' }) {
  const key = type === 'status' ? value : value
  return (
    <span
      className={cn(
        'inline-block rounded-full px-2.5 py-1 text-xs font-semibold capitalize',
        styles[key] ?? 'bg-sidebar text-ink',
      )}
    >
      {labels[key] ?? value?.replace('_', ' ')}
    </span>
  )
}
