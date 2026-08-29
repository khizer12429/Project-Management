export function PageLoader() {
  return (
    <div className="grid min-h-dvh place-items-center bg-paper" role="status" aria-label="Loading">
      <span className="size-7 animate-[spin_0.7s_linear_infinite] rounded-full border-2 border-line border-t-forest" />
    </div>
  )
}
