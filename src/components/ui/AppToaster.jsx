import { Toaster } from 'react-hot-toast'

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        className: 'text-sm font-medium text-ink',
        style: {
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 10px 25px rgba(20, 23, 17, 0.08)',
        },
        success: {
          iconTheme: {
            primary: '#1f6b45',
            secondary: '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#9b2c2c',
            secondary: '#ffffff',
          },
        },
      }}
    />
  )
}
