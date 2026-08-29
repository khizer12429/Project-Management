import * as yup from 'yup'

const name = yup
  .string()
  .trim()
  .required('Name is required')
  .min(2, 'Name must be at least 2 characters')

export const projectSchema = yup.object({
  name: name.max(120, 'Name is too long'),
  description: yup.string().trim().max(500, 'Description is too long').default(''),
})

export const userSchema = yup.object({
  fullName: name.max(80, 'Name is too long'),
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

export const taskSchema = yup.object({
  projectId: yup.string().required('Project is required'),
  title: yup.string().trim().required('Title is required').max(200, 'Title is too long'),
  description: yup.string().trim().max(1000, 'Description is too long').default(''),
  status: yup
    .string()
    .oneOf(['todo', 'in_progress', 'done'], 'Select a valid status')
    .required(),
  priority: yup
    .string()
    .oneOf(['low', 'medium', 'high'], 'Select a valid priority')
    .required(),
  dueDate: yup.string().nullable().default(''),
  assignedTo: yup.string().nullable().default(''),
})
