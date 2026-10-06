const variants = {
  glass: 'glass-card',
  panel: 'glass-panel',
  subtle: 'glass-panel-subtle',
}

const radii = {
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
}

export default function Card({ variant = 'glass', radius = '3xl', className = '', children, style = {} }) {
  return (
    <div
      className={`${variants[variant] || variants.glass} ${radii[radius] || radii['3xl']} ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}