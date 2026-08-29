import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { clearAuthError, login, selectAuth } from '@/features/auth/authSlice'
import { loginSchema } from '@/features/auth/schemas'

export function LoginForm() {
  const dispatch = useAppDispatch()
  const { status, error } = useAppSelector(selectAuth)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  const onSubmit = (values) => {
    dispatch(login({ email: values.email, password: values.password }))
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      {error && <Alert>{error}</Alert>}
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Password"
        autoComplete="current-password"
        toggleVisibility
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" fullWidth isLoading={status === 'loading'}>
        Sign in
      </Button>
    </form>
  )
}
