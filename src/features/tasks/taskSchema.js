import * as yup from 'yup'

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
  dueDate: yup.string().nullable(),
  assignedTo: yup.string().nullable().default(''),
})
