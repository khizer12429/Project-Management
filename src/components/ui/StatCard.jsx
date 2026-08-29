export function StatCard({ label, value, variant = 'orange' }) {
  const styles =
    variant === 'orange'
      ? 'bg-stat-orange text-white'
      : 'bg-stat-beige text-ink'

  return (
    <article className={`rounded-xl px-6 py-5 shadow-sm ${styles}`}>
      <p className="m-0 text-3xl font-semibold">{value ?? 0}</p>
      <p className="mt-1 mb-0 text-sm opacity-90">{label}</p>
    </article>
  )
}
