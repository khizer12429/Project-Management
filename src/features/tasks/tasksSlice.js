import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  createTask,
  deleteTask,
  fetchAssignableUsers,
  fetchTasks,
  updateTask,
  updateTaskStatus,
} from '@/features/tasks/tasksApi'

const initialState = {
  items: [],
  assignees: [],
  filters: {
    projectId: '',
    status: '',
    priority: '',
  },
  status: 'idle',
  actionStatus: 'idle',
  error: null,
}

export const loadTasks = createAsyncThunk(
  'tasks/load',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchTasks()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const loadAssignees = createAsyncThunk(
  'tasks/loadAssignees',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchAssignableUsers()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const addTask = createAsyncThunk(
  'tasks/add',
  async (payload, { rejectWithValue }) => {
    try {
      return await createTask(payload)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const editTaskStatus = createAsyncThunk(
  'tasks/editStatus',
  async (payload, { rejectWithValue }) => {
    try {
      return await updateTaskStatus(payload)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const editTask = createAsyncThunk(
  'tasks/edit',
  async (payload, { rejectWithValue }) => {
    try {
      return await updateTask(payload)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const removeTask = createAsyncThunk(
  'tasks/remove',
  async (id, { rejectWithValue }) => {
    try {
      await deleteTask(id)
      return id
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTasksError(state) {
      state.error = null
    },
    setTaskFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTasks.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loadTasks.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(loadTasks.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(loadAssignees.fulfilled, (state, action) => {
        state.assignees = action.payload
      })
      .addCase(addTask.pending, (state) => {
        state.actionStatus = 'loading'
        state.error = null
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded'
        state.items = [action.payload, ...state.items]
      })
      .addCase(addTask.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.error = action.payload
      })
      .addCase(editTask.pending, (state) => {
        state.actionStatus = 'loading'
        state.error = null
      })
      .addCase(editTask.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded'
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        )
      })
      .addCase(editTask.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.error = action.payload
      })
      .addCase(editTaskStatus.pending, (state) => {
        state.actionStatus = 'loading'
        state.error = null
      })
      .addCase(editTaskStatus.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded'
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        )
      })
      .addCase(editTaskStatus.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.error = action.payload
      })
      .addCase(removeTask.pending, (state) => {
        state.actionStatus = 'loading'
        state.error = null
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded'
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
      .addCase(removeTask.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.error = action.payload
      })
  },
})

export const { clearTasksError, setTaskFilters } = tasksSlice.actions
export const selectTasks = (state) => state.tasks

export default tasksSlice.reducer
