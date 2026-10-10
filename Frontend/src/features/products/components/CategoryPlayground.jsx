import { categories } from '@/features/products/fixtures/categories.fixture'
import { useNavigate } from 'react-router-dom'
import Reveal from '@/shared/components/ui/Reveal'

export default function CategoryPlayground() {
  const navigate = useNavigate()
  const routeFor = (id) => {
    switch (id) {
      case 'maquillaje':
        return '/maquillaje'
      case 'cabello':
        return '/cabello'
      case 'glow-deals':
        return '/ofertas'
      default:
        return '/descubrir'
    }
  }

  return (
    <section className="py-12 bg-white/40 border-y border-white/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-glowe-pink-accent">
              Explora por Categoría
            </span>
            <h2 className="font-serif text-3xl font-bold text-glowe-dark">Tu Beauty Playground 🎨</h2>
          </div>
          <p className="text-xs sm:text-sm text-glowe-muted mt-2 md:mt-0">
            Encuentra exactamente lo que necesitas para tu rutina diaria
          </p>
        </div>

        <Reveal className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(routeFor(cat.id))}
              className={`group glass-card rounded-2xl p-5 text-center relative overflow-hidden flex flex-col items-center border-b-4 ${cat.border}`}
            >
              <div
                className={`w-16 h-16 rounded-2xl ${cat.bg} flex items-center justify-center text-3xl mb-3 group-hover:scale-110 transition-transform duration-300 shadow-inner`}
              >
                {cat.icon}
              </div>
              <h3 className={`font-bold text-glowe-dark text-sm sm:text-base transition-colors group-hover:${cat.accent}`}>
                {cat.name}
              </h3>
              <span className="text-xs text-glowe-muted mt-1">{cat.sub}</span>
              <span
                className={`mt-3 text-[11px] font-semibold ${cat.accent} opacity-0 group-hover:opacity-100 transition-opacity`}
              >
                Ver productos →
              </span>
            </button>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
