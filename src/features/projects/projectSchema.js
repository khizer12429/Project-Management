import * as yup from 'yup'

export const projectSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(120, 'Name is too long'),
  description: yup.string().trim().max(500, 'Description is too long').default(''),
})
