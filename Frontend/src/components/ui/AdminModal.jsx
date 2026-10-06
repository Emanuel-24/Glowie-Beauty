import { useEffect } from 'react'

export default function AdminModal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) {
  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className={`max-h-[calc(100dvh-0.75rem)] w-full overflow-y-auto rounded-t-[2rem] border border-white/40 bg-white/90 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-xl backdrop-blur-md sm:max-h-[calc(100dvh-2rem)] sm:rounded-[2rem] sm:p-6 ${maxWidth}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-glowe-pink-accent">Editor</p>
            <h2 className="mt-2 font-serif text-2xl font-bold text-glowe-dark">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/80 bg-white/70 p-2 text-glowe-dark" aria-label="Cerrar modal">✕</button>
        </div>

        {children}
      </div>
    </div>
  )
}
