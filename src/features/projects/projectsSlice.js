import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  createProject,
  deleteProject,
  fetchProjects,
  updateProject,
} from '@/features/projects/projectsApi'

const initialState = {
  items: [],
  status: 'idle',
  actionStatus: 'idle',
  error: null,
}

export const loadProjects = createAsyncThunk(
  'projects/load',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchProjects()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const addProject = createAsyncThunk(
  'projects/add',
  async (payload, { rejectWithValue }) => {
    try {
      return await createProject(payload)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const editProject = createAsyncThunk(
  'projects/edit',
  async (payload, { rejectWithValue }) => {
    try {
      return await updateProject(payload)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const removeProject = createAsyncThunk(
  'projects/remove',
  async (id, { rejectWithValue }) => {
    try {
      await deleteProject(id)
      return id
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearProjectsError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadProjects.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loadProjects.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(loadProjects.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(addProject.pending, (state) => {
        state.actionStatus = 'loading'
        state.error = null
      })
      .addCase(addProject.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded'
        state.items = [action.payload, ...state.items]
      })
      .addCase(addProject.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.error = action.payload
      })
      .addCase(editProject.pending, (state) => {
        state.actionStatus = 'loading'
        state.error = null
      })
      .addCase(editProject.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded'
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        )
      })
      .addCase(editProject.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.error = action.payload
      })
      .addCase(removeProject.pending, (state) => {
        state.actionStatus = 'loading'
        state.error = null
      })
      .addCase(removeProject.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded'
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
      .addCase(removeProject.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.error = action.payload
      })
  },
})

export const { clearProjectsError } = projectsSlice.actions
export const selectProjects = (state) => state.projects

export default projectsSlice.reducer
