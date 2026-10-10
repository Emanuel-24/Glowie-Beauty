const badgeStyles = {
  success: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  danger: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
  warning: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
  info: 'bg-sky-100 text-sky-700 ring-1 ring-sky-200',
  neutral: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
}

export default function StatusBadge({ status, tone = 'neutral', children, className = '' }) {
  const label = children ?? status

  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]',
        badgeStyles[tone] || badgeStyles.neutral,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {label}
    </span>
  )
}
