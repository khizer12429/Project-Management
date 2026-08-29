import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/features/auth/authSlice'
import dashboardReducer from '@/features/dashboard/dashboardSlice'
import projectsReducer from '@/features/projects/projectsSlice'
import tasksReducer from '@/features/tasks/tasksSlice'
import usersReducer from '@/features/users/usersSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    projects: projectsReducer,
    tasks: tasksReducer,
    users: usersReducer,
  },
})
