import { useEffect } from 'react'
import { useAppDispatch } from '@/app/hooks'
import { initializeAuth } from '@/features/auth/authSlice'
import { isSupabaseConfigured } from '@/lib/supabase'
import { SetupPage } from '@/pages/SetupPage'
import { AppRouter } from '@/routes/AppRouter'

export default function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (isSupabaseConfigured) {
      dispatch(initializeAuth())
    }
  }, [dispatch])

  if (!isSupabaseConfigured) {
    return <SetupPage />
  }

  return <AppRouter />
}
