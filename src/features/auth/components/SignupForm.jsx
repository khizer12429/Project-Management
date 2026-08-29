import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { clearAuthError, selectAuth, signup } from '@/features/auth/authSlice'
import { signupSchema } from '@/features/auth/schemas'

export function SignupForm() {
  const dispatch = useAppDispatch()
  const { status, error } = useAppSelector(selectAuth)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signupSchema),
    mode: 'onBlur',
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  const onSubmit = (values) => {
    dispatch(
      signup({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      }),
    )
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      {error && <Alert>{error}</Alert>}
      <Input
        label="Full name"
        autoComplete="name"
        error={errors.fullName?.message}
        {...register('fullName')}
      />
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Password"
        autoComplete="new-password"
        toggleVisibility
        error={errors.password?.message}
        {...register('password')}
      />
      <Input
        label="Confirm password"
        autoComplete="new-password"
        toggleVisibility
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <Button type="submit" fullWidth isLoading={status === 'loading'}>
        Create account
      </Button>
    </form>
  )
}
