const badgeStyles = {
  success: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300',
  danger: 'bg-rose-100 text-rose-800 ring-1 ring-rose-300',
  warning: 'bg-amber-100 text-amber-800 ring-1 ring-amber-300',
  info: 'bg-sky-100 text-sky-800 ring-1 ring-sky-300',
  accent: 'bg-pink-100 text-pink-800 ring-1 ring-pink-300',
  neutral: 'bg-slate-100 text-slate-800 ring-1 ring-slate-300',
}

export default function StatusBadge({ status, label, tone = 'neutral', children, className = '' }) {
  const displayLabel = children ?? label ?? status ?? 'Activo'

  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]',
        badgeStyles[tone] || badgeStyles.neutral,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {displayLabel}
    </span>
  )
}
