import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import {
  createTaskComment,
  fetchTaskComments,
} from '@/features/tasks/taskCommentsApi'
import { toastCreated } from '@/lib/toast'

export function TaskComments({ taskId, currentUserId, canComment }) {
  const [comments, setComments] = useState([])
  const [body, setBody] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadComments() {
      setStatus('loading')
      setError(null)

      try {
        const data = await fetchTaskComments(taskId)
        setComments(data)
        setStatus('succeeded')
      } catch (loadError) {
        setError(loadError.message)
        setStatus('failed')
      }
    }

    loadComments()
  }, [taskId])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!body.trim()) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const comment = await createTaskComment({ taskId, body })
      setComments((current) => [...current, comment])
      setBody('')
      toastCreated('Comment')
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-4 border-t border-border pt-4">
      <h3 className="m-0 text-sm font-semibold text-ink">Comments</h3>

      {status === 'loading' ? (
        <p className="mt-3 text-sm text-muted">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No comments yet.</p>
      ) : (
        <ul className="mt-3 grid max-h-48 list-none gap-3 overflow-y-auto p-0">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-lg border border-border bg-paper px-3 py-2 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-ink">
                  {comment.authorName}
                  {comment.userId === currentUserId && (
                    <span className="ml-1 text-xs font-normal text-muted">(you)</span>
                  )}
                </span>
                <time className="text-xs text-muted">
                  {new Date(comment.createdAt).toLocaleString()}
                </time>
              </div>
              <p className="m-0 mt-1 whitespace-pre-wrap text-ink">{comment.body}</p>
            </li>
          ))}
        </ul>
      )}

      {canComment && (
        <form className="mt-4 grid gap-3" onSubmit={handleSubmit}>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Write a comment…"
            rows={3}
            className="w-full resize-y rounded-xl border border-line bg-paper-raised px-3.5 py-3 text-sm text-ink outline-none focus:border-forest focus:shadow-[0_0_0_4px_rgba(30,58,47,0.12)]"
          />
          {error && <p className="m-0 text-sm text-danger">{error}</p>}
          <div className="flex justify-end">
            <Button type="submit" isLoading={submitting} className="min-h-0 px-4 py-2 text-sm">
              Add comment
            </Button>
          </div>
        </form>
      )}
    </section>
  )
}
