import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectAuth } from '@/features/auth/authSlice'
import { taskSchema } from '@/features/tasks/taskSchema'
import { loadProjects, selectProjects } from '@/features/projects/projectsSlice'
import {
  addTask,
  clearTasksError,
  editTask,
  editTaskStatus,
  loadAssignees,
  loadTasks,
  removeTask,
  selectTasks,
  setTaskFilters,
} from '@/features/tasks/tasksSlice'
import { TaskComments } from '@/components/tasks/TaskComments'
import { ActivityLog } from '@/components/tasks/ActivityLog'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { Input } from '@/components/ui/Input'
import { Modal, Table } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { cn } from '@/lib/cn'
import { ROLES, TASK_PRIORITY, TASK_STATUS } from '@/lib/constants'
import { matchesNameSearch } from '@/lib/search'
import { toastCreated, toastDeleted, toastUpdated } from '@/lib/toast'

function canCommentOnTask(task, userId, isAdmin) {
  if (!task || !userId) {
    return false
  }

  if (isAdmin) {
    return true
  }

  return task.createdBy === userId
}

function isOverdue(task) {
  if (!task.dueDate || task.status === TASK_STATUS.DONE) {
    return false
  }

  return task.dueDate < new Date().toISOString().slice(0, 10)
}

function TaskForm({
  defaultValues,
  projects,
  assignees,
  onSubmit,
  onCancel,
  isLoading,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(taskSchema),
    defaultValues,
  })

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Select label="Project" error={errors.projectId?.message} {...register('projectId')}>
        <option value="">Select project</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </Select>
      <Input label="Title" error={errors.title?.message} {...register('title')} />
      <Input
        label="Description"
        error={errors.description?.message}
        {...register('description')}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Status" error={errors.status?.message} {...register('status')}>
          <option value={TASK_STATUS.TODO}>To Do</option>
          <option value={TASK_STATUS.IN_PROGRESS}>In Progress</option>
          <option value={TASK_STATUS.DONE}>Done</option>
        </Select>
        <Select label="Priority" error={errors.priority?.message} {...register('priority')}>
          <option value={TASK_PRIORITY.LOW}>Low</option>
          <option value={TASK_PRIORITY.MEDIUM}>Medium</option>
          <option value={TASK_PRIORITY.HIGH}>High</option>
        </Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Due date"
          type="date"
          error={errors.dueDate?.message}
          {...register('dueDate')}
        />
        <Select label="Assign to" error={errors.assignedTo?.message} {...register('assignedTo')}>
          <option value="">Unassigned</option>
          {assignees.map((user) => (
            <option key={user.id} value={user.id}>
              {user.full_name}
            </option>
          ))}
        </Select>
      </div>
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

export function TasksPage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(selectAuth)
  const { items: projects } = useAppSelector(selectProjects)
  const { items, assignees, filters, status, actionStatus, error } =
    useAppSelector(selectTasks)
  const isAdmin = user?.role === ROLES.ADMIN
  const [modalOpen, setModalOpen] = useState(false)
  const [viewTask, setViewTask] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingTaskId, setUpdatingTaskId] = useState(null)
  const [activityRefreshKey] = useState(0)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(loadTasks())
    }
    dispatch(loadProjects())
    dispatch(loadAssignees())
    dispatch(clearTasksError())
  }, [dispatch, status])

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim()

    return items.filter((task) => {
      if (query) {
        return matchesNameSearch(searchQuery, task.title)
      }
      if (filters.projectId && task.projectId !== filters.projectId) {
        return false
      }
      if (filters.status && task.status !== filters.status) {
        return false
      }
      if (filters.priority && task.priority !== filters.priority) {
        return false
      }
      return true
    })
  }, [items, filters, searchQuery])

  const closeModal = () => {
    setModalOpen(false)
    setViewTask(null)
    setEditingTask(null)
  }

  const openCreate = () => {
    setViewTask(null)
    setEditingTask(null)
    setModalOpen(true)
  }

  const openEdit = (task) => {
    setViewTask(null)
    setEditingTask(task)
    setModalOpen(true)
  }

  const handleSubmit = async (values) => {
    const payload = {
      projectId: values.projectId,
      title: values.title,
      description: values.description,
      status: values.status,
      priority: values.priority,
      dueDate: values.dueDate,
      assignedTo: values.assignedTo || null,
    }

    try {
      if (editingTask) {
        await dispatch(editTask({ id: editingTask.id, ...payload })).unwrap()
        closeModal()
      } else {
        await dispatch(addTask(payload)).unwrap()
        closeModal()
      }
    } catch {
      // Error is stored in Redux state.
    }

    if (editingTask) {
      toastUpdated('Task', payload.title)
    } else {
      toastCreated('Task', payload.title)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) {
      return
    }

    try {
      const title = deleteTarget.title
      await dispatch(removeTask(deleteTarget.id)).unwrap()
      setDeleteTarget(null)
      toastDeleted('Task', title)
    } catch {
      // Error is stored in Redux state.
    }
  }

  const handleStatusChange = async (taskId, status) => {
    setUpdatingTaskId(taskId)
    try {
      await dispatch(editTaskStatus({ id: taskId, status })).unwrap()
    } catch {
      // Error is stored in Redux state.
    } finally {
      setUpdatingTaskId(null)
      toastUpdated('Task status')
    }
  }

  const columns = [
    {
      key: 'title',
      label: 'Task',
      render: (row) => (
        <div>
          <p className="m-0 font-medium text-ink">{row.title}</p>
          <p className="m-0 text-xs text-muted">{row.projectName}</p>
        </div>
      ),
    },
    {
      key: 'assignee',
      label: 'Assignee',
      render: (row) => row.assigneeName ?? 'Unassigned',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const isAssignee = row.assignedTo === user?.id

        if (!isAdmin && isAssignee) {
          return (
            <Select
              value={row.status}
              disabled={updatingTaskId === row.id}
              onChange={(event) => handleStatusChange(row.id, event.target.value)}
              className="min-w-36"
            >
              <option value={TASK_STATUS.TODO}>To Do</option>
              <option value={TASK_STATUS.IN_PROGRESS}>In Progress</option>
              <option value={TASK_STATUS.DONE}>Done</option>
            </Select>
          )
        }

        return <Badge value={row.status} type="status" />
      },
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (row) => <Badge value={row.priority} type="priority" />,
    },
    {
      key: 'due_date',
      label: 'Due date',
      render: (row) => (
        <span className={cn(isOverdue(row) && 'font-semibold text-danger')}>
          {row.dueDate ? new Date(`${row.dueDate}T00:00:00`).toLocaleDateString() : '—'}
          {isOverdue(row) && ' (Overdue)'}
        </span>
      ),
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
              setViewTask(row)
              setEditingTask(null)
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
          <h1 className="m-0 text-2xl font-semibold text-ink">Tasks</h1>
          <p className="mt-1 text-muted">
            {isAdmin
              ? 'Create, update, assign, and track task status and due dates.'
              : 'View and update status on tasks assigned to you.'}
          </p>
        </div>
        {isAdmin && <Button onClick={openCreate}>Add Task</Button>}
      </div>

      {error && <Alert className="mb-6">{error}</Alert>}

      <div className="mb-6 grid gap-4 rounded-xl border border-border bg-surface p-4 md:grid-cols-2 xl:grid-cols-4">
        <Input
          label="Search by name"
          placeholder="Search tasks…"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        <Select
          label="Filter by project"
          value={filters.projectId}
          onChange={(event) =>
            dispatch(setTaskFilters({ projectId: event.target.value }))
          }
        >
          <option value="">All projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </Select>
        <Select
          label="Filter by status"
          value={filters.status}
          onChange={(event) => dispatch(setTaskFilters({ status: event.target.value }))}
        >
          <option value="">All statuses</option>
          <option value={TASK_STATUS.TODO}>To Do</option>
          <option value={TASK_STATUS.IN_PROGRESS}>In Progress</option>
          <option value={TASK_STATUS.DONE}>Done</option>
        </Select>
        <Select
          label="Filter by priority"
          value={filters.priority}
          onChange={(event) =>
            dispatch(setTaskFilters({ priority: event.target.value }))
          }
        >
          <option value="">All priorities</option>
          <option value={TASK_PRIORITY.LOW}>Low</option>
          <option value={TASK_PRIORITY.MEDIUM}>Medium</option>
          <option value={TASK_PRIORITY.HIGH}>High</option>
        </Select>
      </div>

      {status === 'loading' ? (
        <p className="text-muted">Loading tasks…</p>
      ) : (
        <Table
          columns={columns}
          rows={filteredItems}
          emptyMessage={
            searchQuery.trim()
              ? 'No matching tasks found.'
              : isAdmin
                ? 'No tasks found. Create your first task.'
                : 'No tasks to view yet.'
          }
        />
      )}

      <Modal
        open={modalOpen}
        wide={Boolean(viewTask)}
        title={viewTask ? 'View task' : editingTask ? 'Edit task' : 'Add task'}
        onClose={closeModal}
      >
        {viewTask ? (
          <div className="grid gap-3 text-sm">
            <p className="m-0">
              <span className="font-semibold">Title:</span> {viewTask.title}
            </p>
            <p className="m-0">
              <span className="font-semibold">Project:</span> {viewTask.projectName}
            </p>
            <p className="m-0">
              <span className="font-semibold">Description:</span>{' '}
              {viewTask.description || '—'}
            </p>
            <p className="m-0 flex items-center gap-2">
              <span className="font-semibold">Status:</span>{' '}
              <Badge value={viewTask.status} type="status" />
            </p>
            <p className="m-0 flex items-center gap-2">
              <span className="font-semibold">Priority:</span>{' '}
              <Badge value={viewTask.priority} type="priority" />
            </p>
            <p className="m-0">
              <span className="font-semibold">Assignee:</span>{' '}
              {viewTask.assigneeName ?? 'Unassigned'}
            </p>
            <p className="m-0">
              <span className="font-semibold">Due date:</span>{' '}
              {viewTask.dueDate
                ? new Date(`${viewTask.dueDate}T00:00:00`).toLocaleDateString()
                : '—'}
            </p>
            <TaskComments
              taskId={viewTask.id}
              currentUserId={user?.id}
              canComment={canCommentOnTask(viewTask, user?.id, isAdmin)}
            />
            <div className="flex justify-end pt-2">
              <Button variant="ghost" onClick={closeModal}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <TaskForm
            projects={projects}
            assignees={assignees}
            defaultValues={{
              projectId: editingTask?.projectId ?? '',
              title: editingTask?.title ?? '',
              description: editingTask?.description ?? '',
              status: editingTask?.status ?? TASK_STATUS.TODO,
              priority: editingTask?.priority ?? TASK_PRIORITY.MEDIUM,
              dueDate: editingTask?.dueDate ?? '',
              assignedTo: editingTask?.assignedTo ?? '',
            }}
            onSubmit={handleSubmit}
            onCancel={closeModal}
            isLoading={actionStatus === 'loading'}
          />
        )}
      </Modal>

      <DeleteConfirmModal
        open={Boolean(deleteTarget)}
        itemName={deleteTarget?.title}
        entityLabel="task"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isLoading={actionStatus === 'loading'}
      />

      {isAdmin && <ActivityLog refreshKey={activityRefreshKey} />}
    </div>
  )
}
