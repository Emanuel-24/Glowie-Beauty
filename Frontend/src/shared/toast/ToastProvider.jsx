import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

export const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  const showToast = useCallback((title, message, icon = '✨') => {
    setToast({ title, message, icon })
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setToast(null), 3000)
  }, [])

  useEffect(() => () => timerRef.current && clearTimeout(timerRef.current), [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed top-20 left-4 right-4 z-[80] flex max-w-sm items-center gap-3 rounded-2xl border border-glowe-pink px-4 py-3 shadow-glass-hover glass-panel animate-[slideIn_.3s_ease-out] sm:left-auto sm:top-24">
          <span className="text-xl">{toast.icon}</span>
          <div className="min-w-0">
            <h5 className="text-xs font-bold text-glowe-dark">{toast.title}</h5>
            <p className="text-[11px] text-glowe-muted break-words">{toast.message}</p>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}
