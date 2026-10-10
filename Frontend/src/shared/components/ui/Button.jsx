const variants = {
  primary:
    'bg-glowe-pink-accent hover:bg-rose-500 text-white shadow-md hover:shadow-lg hover:scale-[1.02]',
  glass: 'glass-panel hover:bg-white text-glowe-dark border-glowe-pink/40 hover:border-glowe-pink',
  soft: 'bg-glowe-pink hover:bg-glowe-pink-accent text-glowe-dark hover:text-white shadow-sm hover:shadow-md hover:scale-105',
  gradient:
    'bg-gradient-to-r from-glowe-pink to-glowe-pink-dark hover:from-glowe-pink-dark hover:to-glowe-pink-accent text-glowe-dark hover:text-white shadow-sm hover:shadow-md',
  dark: 'bg-glowe-dark text-white hover:bg-glowe-dark/80',
  plain: '',
}

const sizes = {
  sm: 'min-h-10 px-3 py-2 text-xs',
  md: 'min-h-11 px-5 py-2.5 text-xs sm:text-sm',
  lg: 'min-h-12 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base',
  icon: 'h-11 w-11 p-0',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-full font-bold whitespace-nowrap transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glowe-pink-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        'disabled:opacity-60 disabled:pointer-events-none',
        loading ? 'opacity-70 pointer-events-none' : '',
        variants[variant] || variants.plain,
        sizes[size] || sizes.md,
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin"
        />
      )}
      {children}
    </button>
  )
}
