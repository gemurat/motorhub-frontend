import { useState } from 'react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastState {
  isVisible: boolean
  message: string
  type: ToastType
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    isVisible: false,
    message: '',
    type: 'success',
  })

  const showToast = (type: ToastType, message: string) => {
    setToast({ isVisible: true, message, type })
    setTimeout(() => {
      setToast({ isVisible: false, message: '', type })
    }, 3000)
  }

  return {
    toast,
    showToast,
  }
}
