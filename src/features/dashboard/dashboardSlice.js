import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchDashboardStats } from '@/features/dashboard/dashboardApi'

const initialState = {
  stats: null,
  status: 'idle',
  error: null,
}

export const loadDashboardStats = createAsyncThunk(
  'dashboard/loadStats',
  async (isAdmin, { getState, rejectWithValue }) => {
    try {
      const { stats, status } = getState().dashboard
      if (status === 'succeeded' && stats) {
        return stats
      }
      return await fetchDashboardStats(isAdmin)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDashboardStats.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loadDashboardStats.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.stats = action.payload
      })
      .addCase(loadDashboardStats.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  },
})

export const { clearDashboardError } = dashboardSlice.actions
export const selectDashboard = (state) => state.dashboard

export default dashboardSlice.reducer
