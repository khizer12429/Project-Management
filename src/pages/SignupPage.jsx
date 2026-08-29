import { Link } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { SignupForm } from '@/features/auth/components/SignupForm'
import { ROUTES } from '@/lib/constants'

export function SignupPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Signup is for team members. Admins are created from the admin panel."
      footer={
        <>
          Already have an account? <Link to={ROUTES.LOGIN}>Sign in</Link>
        </>
      }
    >
      <SignupForm />
    </AuthLayout>
  )
}
