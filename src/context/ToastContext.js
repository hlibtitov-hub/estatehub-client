'use client'

// Thin wrapper over Sonner — keeps the same useToast() API across the whole app
// so no call sites need to change: toast('Message', 'success') still works everywhere.

import { createContext, useContext } from 'react'
import { toast as sonnerToast } from 'sonner'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  return (
    <ToastContext.Provider value={null}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  return (message, type = 'info') => {
    if (type === 'success') sonnerToast.success(message)
    else if (type === 'error') sonnerToast.error(message)
    else if (type === 'warning') sonnerToast.warning(message)
    else sonnerToast(message)
  }
}
