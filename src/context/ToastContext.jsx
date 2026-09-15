import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'

const ToastContext = createContext(null)
let nextId = 1

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message, { type = 'success', duration = 4000 } = {}) => {
      const id = nextId++
      setToasts((prev) => [...prev, { id, message, type }])
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration)
      }
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium shadow-md ${
              toast.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-accent/30 bg-surface text-ink'
            }`}
          >
            {toast.type === 'error' ? (
              <XCircle size={16} className="shrink-0 text-red-600" />
            ) : (
              <CheckCircle2 size={16} className="shrink-0 text-accent" />
            )}
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Fechar aviso"
              className="-m-1.5 ml-1 shrink-0 rounded p-1.5 text-muted hover:text-ink"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast precisa ser usado dentro de um <ToastProvider>')
  }
  return context
}
