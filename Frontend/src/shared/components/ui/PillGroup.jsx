const defaultActive = 'bg-white shadow-sm text-glowe-pink-accent font-bold'
const defaultInactive = 'font-semibold text-glowe-muted hover:text-glowe-dark'

export default function PillGroup({
  options = [],
  activeValue,
  onChange,
  ariaLabel = 'Filtrar',
  containerClassName = '',
  className = '',
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`flex flex-wrap items-center gap-1 ${containerClassName}`}
    >
      {options.map((pill) => {
        const active = pill.value === activeValue
        return (
          <button
            key={pill.value}
            onClick={() => onChange(pill.value)}
            aria-pressed={active}
            aria-current={active ? 'true' : undefined}
            className={`min-h-10 px-4 py-1.5 rounded-full text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glowe-pink-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 ${
              active
                ? pill.activeClass || defaultActive
                : pill.inactiveClass || defaultInactive
            } ${pill.className || ''} ${className}`}
          >
            {pill.label}
          </button>
        )
      })}
    </div>
  )
}
