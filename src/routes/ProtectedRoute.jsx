import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { PageLoader } from '@/components/ui/PageLoader'
import { selectAuth } from '@/features/auth/authSlice'
import { ROUTES } from '@/lib/constants'

export function ProtectedRoute() {
  const { user, initialized } = useAppSelector(selectAuth)

  if (!initialized) {
    return <PageLoader />
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return <Outlet />
}
