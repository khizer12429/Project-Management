import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { initializeAuth } from '@/features/auth/authSlice'
import {
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
} from '@/features/users/usersApi'

const initialState = {
  items: [],
  status: 'idle',
  actionStatus: 'idle',
  error: null,
}

export const loadUsers = createAsyncThunk(
  'users/load',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchUsers()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const addUser = createAsyncThunk(
  'users/add',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const user = await createUser(payload)
      await dispatch(initializeAuth())
      return user
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const editUser = createAsyncThunk(
  'users/edit',
  async (payload, { rejectWithValue }) => {
    try {
      return await updateUser(payload)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const removeUser = createAsyncThunk(
  'users/remove',
  async (id, { rejectWithValue }) => {
    try {
      await deleteUser(id)
      return id
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUsersError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUsers.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loadUsers.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(loadUsers.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(addUser.pending, (state) => {
        state.actionStatus = 'loading'
        state.error = null
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded'
        state.items = [action.payload, ...state.items]
      })
      .addCase(addUser.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.error = action.payload
      })
      .addCase(editUser.pending, (state) => {
        state.actionStatus = 'loading'
        state.error = null
      })
      .addCase(editUser.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded'
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        )
      })
      .addCase(editUser.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.error = action.payload
      })
      .addCase(removeUser.pending, (state) => {
        state.actionStatus = 'loading'
        state.error = null
      })
      .addCase(removeUser.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded'
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
      .addCase(removeUser.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.error = action.payload
      })
  },
})

export const { clearUsersError } = usersSlice.actions
export const selectUsers = (state) => state.users

export default usersSlice.reducer
