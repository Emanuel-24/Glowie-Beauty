import { Eye, Pencil, Trash2, CheckCircle, Ban, Zap, CreditCard } from 'lucide-react'

const variants = {
  view: 'bg-sky-50 text-sky-700 hover:bg-sky-100',
  edit: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
  delete: 'bg-rose-50 text-rose-700 hover:bg-rose-100',
  confirm: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  ban: 'bg-rose-50 text-rose-700 hover:bg-rose-100',
  offer: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
  payment: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  neutral: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
}

const icons = {
  view: Eye,
  edit: Pencil,
  delete: Trash2,
  confirm: CheckCircle,
  ban: Ban,
  offer: Zap,
  payment: CreditCard,
}

export default function ActionButton({
  type = 'neutral',
  children,
  onClick,
  title,
  className = '',
  disabled = false,
  ...props
}) {
  const Icon = icons[type] || null
  const label = title || props['aria-label'] || (typeof children === 'string' ? children : undefined)

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={title || label}
      className={[
        'inline-flex h-9 w-9 items-center justify-center rounded-xl transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs',
        variants[type] || variants.neutral,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children ?? (Icon && <Icon className="h-4 w-4" aria-hidden="true" />)}
    </button>
  )
}
