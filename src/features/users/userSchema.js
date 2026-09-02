import * as yup from 'yup'

export const userSchema = yup.object({
  fullName: yup
    .string()
    .trim()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name is too long'),
  email: yup.string().trim().required('Email is required').email('Enter a valid email'),
  password: yup.string().when('$isEdit', {
    is: true,
    then: (schema) => schema.notRequired(),
    otherwise: (schema) =>
      schema
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters'),
  }),
  role: yup.string().oneOf(['admin', 'user'], 'Select a valid role').required(),
})
