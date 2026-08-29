import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { userSchema } from '@/features/admin/schemas'
import {
  addUser,
  clearUsersError,
  editUser,
  loadUsers,
  removeUser,
  selectUsers,
} from '@/features/users/usersSlice'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { Input } from '@/components/ui/Input'
import { Modal, Table } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { cn } from '@/lib/cn'
import { matchesNameSearch } from '@/lib/search'
import { toastCreated, toastDeleted, toastUpdated } from '@/lib/toast'

function UserForm({ defaultValues, isEdit, onSubmit, onCancel, isLoading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(userSchema),
    context: { isEdit },
    defaultValues,
  })

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Input label="Full name" error={errors.fullName?.message} {...register('fullName')} />
      <Input
        label="Email"
        type="email"
        error={errors.email?.message}
        {...register('email')}
      />
      {!isEdit && (
        <Input
          label="Password"
          toggleVisibility
          error={errors.password?.message}
          {...register('password')}
        />
      )}
      <Select label="Role" error={errors.role?.message} {...register('role')}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </Select>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Save
        </Button>
      </div>
    </form>
  )
}

export function UsersPage() {
  const dispatch = useAppDispatch()
  const { items, status, actionStatus, error } = useAppSelector(selectUsers)
  const [modalOpen, setModalOpen] = useState(false)
  const [viewUser, setViewUser] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    dispatch(loadUsers())
    dispatch(clearUsersError())
  }, [dispatch])

  const closeModal = () => {
    setModalOpen(false)
    setViewUser(null)
    setEditingUser(null)
  }

  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        await dispatch(
          editUser({
            id: editingUser.id,
            fullName: values.fullName,
            email: values.email,
            role: values.role,
          }),
        ).unwrap()
        toastUpdated('User', values.fullName)
      } else {
        await dispatch(addUser(values)).unwrap()
        toastCreated('User', values.fullName)
      }
      closeModal()
    } catch {
      // Error is stored in Redux state.
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) {
      return
    }

    try {
      const name = deleteTarget.full_name
      await dispatch(removeUser(deleteTarget.id)).unwrap()
      setDeleteTarget(null)
      toastDeleted('User', name)
    } catch {
      // Error is stored in Redux state.
    }
  }

  const filteredItems = useMemo(() => {
    return items.filter((user) => matchesNameSearch(searchQuery, user.full_name))
  }, [items, searchQuery])

  const columns = [
    {
      key: 'full_name',
      label: 'User',
      render: (row) => (
        <div>
          <p className="m-0 font-medium text-ink">{row.full_name}</p>
          <p className="m-0 text-xs text-muted">{row.email || 'No email'}</p>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (row) => (
        <span
          className={cn(
            'rounded-full px-2.5 py-1 text-xs font-semibold capitalize',
            row.role === 'admin'
              ? 'bg-admin-bg text-admin'
              : 'bg-success-bg text-success',
          )}
        >
          {row.role}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (row) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              setViewUser(row)
              setEditingUser(null)
              setModalOpen(true)
            }}
          >
            View
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setEditingUser(row)
              setViewUser(null)
              setModalOpen(true)
            }}
          >
            Edit
          </Button>
          <Button variant="ghost" onClick={() => setDeleteTarget(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="m-0 text-2xl font-semibold text-ink">User Manage</h1>
          <p className="mt-1 text-muted">View, add, edit, and delete users.</p>
        </div>
        <Button
          onClick={() => {
            setEditingUser(null)
            setViewUser(null)
            setModalOpen(true)
          }}
        >
          Add User
        </Button>
      </div>

      {error && <Alert className="mb-6">{error}</Alert>}

      <div className="mb-6">
        <Input
          label="Search by name"
          placeholder="Search users…"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      {status === 'loading' ? (
        <p className="text-muted">Loading users…</p>
      ) : (
        <Table
          key={searchQuery}
          columns={columns}
          rows={filteredItems}
          emptyMessage={
            searchQuery.trim() ? 'No matching users found.' : 'No users found.'
          }
        />
      )}

      <Modal
        open={modalOpen}
        title={viewUser ? 'View user' : editingUser ? 'Edit user' : 'Add user'}
        onClose={closeModal}
      >
        {viewUser ? (
          <div className="grid gap-3 text-sm">
            <p className="m-0">
              <span className="font-semibold">Name:</span> {viewUser.full_name}
            </p>
            <p className="m-0">
              <span className="font-semibold">Email:</span> {viewUser.email || '—'}
            </p>
            <p className="m-0">
              <span className="font-semibold">Role:</span> {viewUser.role}
            </p>
            <p className="m-0">
              <span className="font-semibold">Joined:</span>{' '}
              {new Date(viewUser.created_at).toLocaleDateString()}
            </p>
            <div className="flex justify-end pt-2">
              <Button variant="ghost" onClick={closeModal}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <UserForm
            isEdit={Boolean(editingUser)}
            defaultValues={{
              fullName: editingUser?.full_name ?? '',
              email: editingUser?.email ?? '',
              password: '',
              role: editingUser?.role ?? 'user',
            }}
            onSubmit={handleSubmit}
            onCancel={closeModal}
            isLoading={actionStatus === 'loading'}
          />
        )}
      </Modal>

      <DeleteConfirmModal
        open={Boolean(deleteTarget)}
        itemName={deleteTarget?.full_name}
        entityLabel="user"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isLoading={actionStatus === 'loading'}
      />
    </div>
  )
}
