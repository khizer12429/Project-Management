import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

export function DeleteConfirmModal({
  open,
  itemName,
  entityLabel = 'item',
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  return (
    <Modal open={open} title={`Delete ${entityLabel}`} onClose={onCancel}>
      <p className="m-0 text-sm leading-6 text-muted">
        Are you sure you want to delete{' '}
        <span className="font-semibold text-ink">&ldquo;{itemName}&rdquo;</span>? This action
        cannot be undone.
      </p>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="button" variant="danger" onClick={onConfirm} isLoading={isLoading}>
          Delete
        </Button>
      </div>
    </Modal>
  )
}
