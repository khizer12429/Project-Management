export const STATUS_LABELS = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
}

export function formatStatusLabel(status) {
  return STATUS_LABELS[status] ?? status?.replace('_', ' ') ?? status
}

export function formatActivityMessage(entry) {
  const firstName = entry.userName?.split(' ')[0] ?? 'Someone'

  if (entry.action === 'task_status_changed') {
    const taskTitle = entry.details?.task_title ?? 'Task'
    const fromStatus = formatStatusLabel(entry.details?.from_status)
    const toStatus = formatStatusLabel(entry.details?.to_status)
    return `${firstName} changed "${taskTitle}" status from ${fromStatus} → ${toStatus}`
  }

  return `${firstName} updated activity`
}
