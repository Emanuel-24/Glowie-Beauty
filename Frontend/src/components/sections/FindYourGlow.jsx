import { quizOptions } from '../../data/products'

export default function FindYourGlow({ glowFilter, onSelectFilter }) {
  const handleFilter = (option) => {
    onSelectFilter(option)
  }

  const borderColor = (tag) => {
    switch (tag) {
      case 'cabello':
        return 'hover:border-glowe-blue-dark'
      case 'renovar':
        return 'hover:border-glowe-pink-dark'
      case 'economico':
        return 'hover:border-glowe-yellow-dark'
      case 'regalo':
        return 'hover:border-rose-400'
      default:
        return 'hover:border-glowe-pink'
    }
  }

  return (
    <section id="encuentra-tu-glow" className="py-16 relative scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-glowe-yellow text-glowe-dark font-bold text-xs uppercase tracking-wider mb-2">
            Experiencia Personalizada
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-glowe-dark">Encuentra tu Glow ✨</h2>
          <p className="text-glowe-muted mt-2 text-sm sm:text-base">
            Selecciona la necesidad que buscas cubrir hoy y filtra tus productos al instante.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {quizOptions.map((option) => (
            <button
              key={option.tag}
              onClick={() => handleFilter(option)}
              className={`group min-h-32 rounded-2xl border-2 p-3 text-center glass-card flex flex-col items-center justify-center sm:p-4 ${
                glowFilter?.tag === option.tag ? 'border-glowe-pink' : 'border-transparent'
              } ${borderColor(option.tag)}`}
            >
              <span className="text-2xl mb-2 group-hover:scale-125 transition-transform">{option.icon}</span>
              <span className="text-xs font-bold text-glowe-dark">{option.label}</span>
              <span className="text-[10px] text-glowe-muted mt-1">{option.sub}</span>
            </button>
          ))}
        </div>

        {glowFilter && (
          <div className="mb-8 flex flex-col items-start gap-3 rounded-2xl border border-glowe-pink/50 p-4 glass-panel animate-[fadeIn_.3s_ease-out] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="text-2xl">{glowFilter.icon}</span>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-glowe-dark">{glowFilter.title}</h3>
                <p className="text-[11px] text-glowe-muted sm:text-xs">{glowFilter.desc}</p>
              </div>
            </div>
            <button
              onClick={onSelectFilter.bind(null, null)}
              className="min-h-10 text-xs font-bold text-glowe-pink-accent hover:underline sm:ml-3"
            >
              Ver todos los productos ✕
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
