import { cn } from '@/lib/cn'

export function Brand({ inverted = false, compact = false, className }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 font-display font-semibold',
        inverted ? 'text-paper' : 'text-ink',
        compact ? 'text-xl' : 'text-[1.3rem]',
        className,
      )}
    >
      <span
        className={cn(
          'grid place-items-center bg-clay font-bold text-paper',
          compact ? 'size-8 rounded-[9px] text-[0.9rem]' : 'size-9 rounded-[10px] text-base',
        )}
      >
        H
      </span>
      Helm
    </div>
  )
}
