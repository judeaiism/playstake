import { useState, useCallback } from 'react'

type ToastProps = {
  title: string
  description: string
  variant: 'default' | 'destructive'
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = useCallback((props: ToastProps) => {
    setToasts((prevToasts) => [...prevToasts, props])
  }, [])

  return { toast, toasts }
}