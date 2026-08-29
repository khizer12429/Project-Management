import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { selectAuth } from '@/features/auth/authSlice'
import { ROLES, ROUTES } from '@/lib/constants'

export function AdminRoute() {
  const { user } = useAppSelector(selectAuth)

  if (user?.role !== ROLES.ADMIN) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <Outlet />
}
