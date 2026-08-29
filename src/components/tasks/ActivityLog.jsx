import { useEffect, useState } from 'react'
import { fetchTaskActivity } from '@/features/activity/activityApi'
import { formatActivityMessage } from '@/lib/taskLabels'

export function ActivityLog({ refreshKey = 0 }) {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadActivity() {
      setStatus('loading')
      setError(null)

      try {
        const data = await fetchTaskActivity()
        if (!cancelled) {
          setItems(data)
          setStatus('succeeded')
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message)
          setStatus('failed')
        }
      }
    }

    loadActivity()

    return () => {
      cancelled = true
    }
  }, [refreshKey])

  return (
    <section className="mt-8 rounded-xl border border-border bg-surface p-4 sm:p-6">
      <h2 className="m-0 text-lg font-semibold text-ink">Activity log</h2>
      <p className="mt-1 text-sm text-muted">Recent task status changes across the workspace.</p>

      {status === 'loading' && <p className="mt-4 text-sm text-muted">Loading activity…</p>}
      {error && <p className="mt-4 text-sm text-danger">{error}</p>}

      {status === 'succeeded' && items.length === 0 && (
        <p className="mt-4 text-sm text-muted">No status changes recorded yet.</p>
      )}

      {items.length > 0 && (
        <ul className="mt-4 grid list-none gap-3 p-0">
          {items.map((entry) => (
            <li
              key={entry.id}
              className="flex flex-wrap items-start justify-between gap-2 border-b border-border pb-3 text-sm last:border-0 last:pb-0"
            >
              <p className="m-0 text-ink">{formatActivityMessage(entry)}</p>
              <time className="shrink-0 text-xs text-muted">
                {new Date(entry.createdAt).toLocaleString()}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
