import { AuthLayout } from '@/components/layout/AuthLayout'
import { Alert } from '@/components/ui/Alert'

export function SetupPage() {
  return (
    <AuthLayout
      title="Connect Supabase"
      subtitle="Add your project keys, then restart the dev server."
    >
      <Alert>
        Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` and
        `VITE_SUPABASE_ANON_KEY`.
      </Alert>
    </AuthLayout>
  )
}
