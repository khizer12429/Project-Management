import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectAuth } from '@/features/auth/authSlice'
import { projectSchema } from '@/features/projects/projectSchema'
import {
  addProject,
  clearProjectsError,
  editProject,
  loadProjects,
  removeProject,
  selectProjects,
} from '@/features/projects/projectsSlice'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { Input } from '@/components/ui/Input'
import { Modal, Table } from '@/components/ui/Modal'
import { ROLES } from '@/lib/constants'
import { matchesNameSearch } from '@/lib/search'
import { toastCreated, toastDeleted, toastUpdated } from '@/lib/toast'

function ProjectForm({ defaultValues, onSubmit, onCancel, isLoading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(projectSchema),
    defaultValues,
  })

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Input label="Project name" error={errors.name?.message} {...register('name')} />
      <Input
        label="Description"
        error={errors.description?.message}
        {...register('description')}
      />
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

export function ProjectsPage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(selectAuth)
  const { items, status, actionStatus, error } = useAppSelector(selectProjects)
  const isAdmin = user?.role === ROLES.ADMIN
  const [modalOpen, setModalOpen] = useState(false)
  const [viewProject, setViewProject] = useState(null)
  const [editingProject, setEditingProject] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    dispatch(loadProjects())
    dispatch(clearProjectsError())
  }, [dispatch])

  const openCreate = () => {
    setViewProject(null)
    setEditingProject(null)
    setModalOpen(true)
  }

  const openEdit = (project) => {
    setViewProject(null)
    setEditingProject(project)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setViewProject(null)
    setEditingProject(null)
  }

  const handleSubmit = async (values) => {
    try {
      if (editingProject) {
        await dispatch(
          editProject({
            id: editingProject.id,
            name: values.name,
            description: values.description,
          }),
        ).unwrap()
        toastUpdated('Project', values.name)
      } else {
        await dispatch(addProject(values)).unwrap()
        toastCreated('Project', values.name)
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
      const name = deleteTarget.name
      await dispatch(removeProject(deleteTarget.id)).unwrap()
      setDeleteTarget(null)
      toastDeleted('Project', name)
    } catch {
      toastDeleted('Project', deleteTarget.name)
    }
  }

  const filteredItems = useMemo(() => {
    return items.filter((project) => matchesNameSearch(searchQuery, project.name))
  }, [items, searchQuery])

  const columns = [
    {
      key: 'name',
      label: 'Project',
      render: (row) => (
        <div>
          <p className="m-0 font-medium text-ink">{row.name}</p>
          <p className="m-0 text-xs text-muted">{row.description || 'No description'}</p>
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
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
              setViewProject(row)
              setEditingProject(null)
              setModalOpen(true)
            }}
          >
            View
          </Button>
          {isAdmin && (
            <>
              <Button variant="ghost" onClick={() => openEdit(row)}>
                Edit
              </Button>
              <Button variant="ghost" onClick={() => setDeleteTarget(row)}>
                Delete
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="m-0 text-2xl font-semibold text-ink">Projects</h1>
          <p className="mt-1 text-muted">
            {isAdmin
              ? 'Create, edit, and delete projects.'
              : 'View projects assigned to you.'}
          </p>
        </div>
        {isAdmin && <Button onClick={openCreate}>Add Project</Button>}
      </div>

      {error && <Alert className="mb-6">{error}</Alert>}

      <div className="mb-6">
        <Input
          label="Search by name"
          placeholder="Search projects…"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      {status === 'loading' ? (
        <p className="text-muted">Loading projects…</p>
      ) : (
        <Table
          key={searchQuery}
          columns={columns}
          rows={filteredItems}
          emptyMessage={
            searchQuery.trim()
              ? 'No matching projects found.'
              : isAdmin
                ? 'No projects yet. Create your first one.'
                : 'No projects assigned to you yet.'
          }
        />
      )}

      <Modal
        open={modalOpen}
        title={viewProject ? 'View project' : editingProject ? 'Edit project' : 'Add project'}
        onClose={closeModal}
      >
        {viewProject ? (
          <div className="grid gap-3 text-sm">
            <p className="m-0">
              <span className="font-semibold">Name:</span> {viewProject.name}
            </p>
            <p className="m-0">
              <span className="font-semibold">Description:</span>{' '}
              {viewProject.description || '—'}
            </p>
            <p className="m-0">
              <span className="font-semibold">Created:</span>{' '}
              {new Date(viewProject.created_at).toLocaleDateString()}
            </p>
            <div className="flex justify-end pt-2">
              <Button variant="ghost" onClick={closeModal}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <ProjectForm
            defaultValues={{
              name: editingProject?.name ?? '',
              description: editingProject?.description ?? '',
            }}
            onSubmit={handleSubmit}
            onCancel={closeModal}
            isLoading={actionStatus === 'loading'}
          />
        )}
      </Modal>

      <DeleteConfirmModal
        open={Boolean(deleteTarget)}
        itemName={deleteTarget?.name}
        entityLabel="project"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isLoading={actionStatus === 'loading'}
      />
    </div>
  )
}
