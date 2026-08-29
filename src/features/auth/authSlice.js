import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  getCurrentSession,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
} from '@/features/auth/authApi'

const initialState = {
  user: null,
  status: 'idle',
  error: null,
  initialized: false,
}

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      return await getCurrentSession()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const login = createAsyncThunk(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      return await signInWithEmail(payload)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const signup = createAsyncThunk(
  'auth/signup',
  async (payload, { rejectWithValue }) => {
    try {
      return await signUpWithEmail(payload)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await signOutUser()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.initialized = true
        state.status = 'idle'
        state.error = null
        state.user = action.payload?.user ?? null
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.initialized = true
        state.status = 'idle'
        state.user = null
        state.error = action.payload
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(signup.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.error = null
      })
      .addCase(signup.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(logout.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(logout.fulfilled, (state) => {
        Object.assign(state, initialState, { initialized: true })
      })
      .addCase(logout.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  },
})

export const { clearAuthError } = authSlice.actions

export const selectAuth = (state) => state.auth

export default authSlice.reducer
