import * as yup from 'yup'

const email = yup
  .string()
  .trim()
  .required('Email is required')
  .email('Enter a valid email')

export const loginSchema = yup.object({
  email,
  password: yup.string().required('Password is required'),
})

export const signupSchema = yup.object({
  fullName: yup
    .string()
    .trim()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name is too long')
    .matches(/^[\p{L}\s'-]+$/u, 'Enter a valid name'),
  email,
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Include at least one uppercase letter')
    .matches(/[0-9]/, 'Include at least one number'),
  confirmPassword: yup
    .string()
    .required('Confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
})
