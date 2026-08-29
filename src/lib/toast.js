import toast from 'react-hot-toast'

export function toastCreated(entity, name) {
  toast.success(formatMessage('created', entity, name))
}

export function toastUpdated(entity, name) {
  toast.success(formatMessage('updated', entity, name))
}

export function toastDeleted(entity, name) {
  toast.success(formatMessage('deleted', entity, name))
}

function formatMessage(action, entity, name) {
  if (name) {
    return `${entity} "${name}" ${action}.`
  }

  return `${entity} ${action}.`
}
