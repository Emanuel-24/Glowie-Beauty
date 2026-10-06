const tones = {
  plain: 'shadow-sm',
  white: 'bg-white/90 text-glowe-dark backdrop-blur-md border border-white shadow-sm',
  accent: 'bg-glowe-pink-accent text-white shadow-sm',
  rose: 'bg-rose-500 text-white shadow-sm',
  pink: 'bg-glowe-pink text-glowe-pink-accent shadow-sm',
  blue: 'bg-glowe-blue text-glowe-blue-accent shadow-sm',
  amber: 'bg-glowe-yellow text-amber-800 border border-glowe-yellow-dark',
  neutral: 'bg-glowe-offwhite text-glowe-dark border border-glowe-pink/40',
  dark: 'bg-glowe-dark text-white shadow-sm',
}

export default function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
        tones[tone] || tones.neutral
      } ${className}`}
    >
      {children}
    </span>
  )
}