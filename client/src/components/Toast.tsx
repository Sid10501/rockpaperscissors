import { createContext, useCallback, useContext, useState } from 'react'

interface ToastItem {
  id: number
  message: string
}

const TOAST_DURATION_MS = 3000

const ToastContext = createContext<((message: string) => void) | null>(null)

export function useToast() {
  const addToast = useContext(ToastContext)
  if (!addToast) return { addToast: () => {} }
  return { addToast }
}

interface ToastProviderProps {
  children: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((message: string) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, TOAST_DURATION_MS)
  }, [])

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div
        className="fixed top-12 right-4 z-40 flex flex-col gap-2 max-w-sm pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg border border-gray-600 transition-opacity duration-300"
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
