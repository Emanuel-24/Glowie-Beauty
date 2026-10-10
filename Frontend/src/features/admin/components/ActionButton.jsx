import { Eye, Pencil, Trash2 } from 'lucide-react'

const variants = {
  view: 'bg-sky-50 text-sky-700 hover:bg-sky-100',
  edit: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
  delete: 'bg-rose-50 text-rose-700 hover:bg-rose-100',
  neutral: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
}

const icons = {
  view: Eye,
  edit: Pencil,
  delete: Trash2,
}

export default function ActionButton({ type = 'neutral', children, onClick, className = '', ...props }) {
  const Icon = icons[type] || null
  const label = typeof children === 'string' ? children : undefined
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={[
        'inline-flex h-11 w-11 items-center justify-center rounded-full transition',
        variants[type] || variants.neutral,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
    </button>
  )
}
