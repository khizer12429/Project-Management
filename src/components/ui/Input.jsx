import { forwardRef, useId, useState } from 'react'
import { cn } from '@/lib/cn'

export const Input = forwardRef(function Input(
  { label, error, toggleVisibility = false, id, type = 'text', className, ...props },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const [visible, setVisible] = useState(false)
  const inputType = toggleVisibility ? (visible ? 'text' : 'password') : type

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-ink" htmlFor={inputId}>
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          {...props}
          type={inputType}
          className={cn(
            'h-12 w-full rounded-xl bg-paper-raised px-3.5 text-ink outline-none transition-[border-color,box-shadow] duration-150',
            toggleVisibility && 'pr-18',
            error
              ? 'border border-danger focus:border-danger focus:shadow-[0_0_0_4px_rgba(155,44,44,0.12)]'
              : 'border border-line focus:border-forest focus:shadow-[0_0_0_4px_rgba(30,58,47,0.12)]',
            className,
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        {toggleVisibility && (
          <button
            type="button"
            className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer border-0 bg-transparent px-2 py-1.5 text-[0.8125rem] font-medium text-ink-soft"
            onClick={() => setVisible((value) => !value)}
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="m-0 text-[0.8125rem] text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  )
})
