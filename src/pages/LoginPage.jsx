import { Link } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { ROUTES } from '@/lib/constants'

export function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in as an admin or team member."
      footer={
        <>
          New here? <Link to={ROUTES.SIGNUP}>Create a member account</Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  )
}
