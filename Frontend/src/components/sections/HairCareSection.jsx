import { useNavigate } from 'react-router-dom'
import { hairCards } from '../../data/products'
import Badge from '../ui/Badge'

export default function HairCareSection() {
  const navigate = useNavigate()

  return (
    <section id="cabello" className="py-16 relative bg-gradient-to-b from-transparent via-glowe-blue/30 to-transparent scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5">
            <div className="glass-card rounded-3xl p-6 border-glowe-blue-dark/40 shadow-xl bg-white/80 space-y-4">
              <Badge tone="blue" className="uppercase tracking-wider text-xs">
                Cuidado Capilar
              </Badge>
              <h2 className="font-serif text-3xl font-bold text-glowe-dark">Dale amor a tu cabello 💇‍♀️</h2>
              <p className="text-xs sm:text-sm text-glowe-muted leading-relaxed">
                Tratamientos y productos seleccionados de las mejores marcas capilares, enriquecidos con aceites de Argán, Coco y Seda para reparar, hidratar y darle brillo espejo sin frizz.
              </p>
              <div className="pt-2 space-y-2 text-xs font-semibold text-glowe-dark">
                <div className="flex items-center gap-2">✓ Sin Sulfatos ni Parabenos</div>
                <div className="flex items-center gap-2">✓ Protección Térmica UV</div>
                <div className="flex items-center gap-2">✓ Hidratación Profunda de Puntas</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {hairCards.map((card) => (
              <button
                key={card.name}
                onClick={() => navigate(`/descubrir?tag=${encodeURIComponent(card.name)}`)}
                className="glass-panel p-4 rounded-2xl text-center border-glowe-blue hover:bg-white transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-glowe-blue flex items-center justify-center text-xl mb-2">
                  {card.icon}
                </div>
                <h3 className="font-bold text-xs text-glowe-dark">{card.name}</h3>
                <span className="text-[10px] text-glowe-muted">{card.sub}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
