import { useEffect, useState } from 'react'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { useCountdown } from '../../hooks'
import { getGlowDeals, getProductById } from '../../services/api'
import Reveal from '../ui/Reveal'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'

export default function GlowDeals() {
  const [deals, setDeals] = useState([])
  const { addItem } = useCart()
  const { showToast } = useToast()
  const { hours, minutes, seconds } = useCountdown(8 * 3600 + 42 * 60 + 19)

  useEffect(() => {
    getGlowDeals().then((data) => setDeals(data.deals))
  }, [])

  const handleAdd = async (deal) => {
    const product = await getProductById(deal.productId)
    addItem(product)
    showToast('¡Oferta agregada! ⚡', `${product.name} con descuento en tu carrito.`, '💛')
  }

  return (
    <section id="glow-deals" className="py-16 relative scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-glowe-yellow/80 via-glowe-yellow-dark/40 to-glowe-pink/50 border border-glowe-yellow-dark/50 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-glowe-pink/40 rounded-full blur-3xl pointer-events-none" />

          <Reveal className="relative z-10 flex flex-col items-center justify-between gap-6 lg:flex-row lg:gap-8">
            <div className="text-center md:text-left space-y-3">
              <Badge tone="amber" className="bg-white/80">
                ⚡ OFERTAS POR TIEMPO LIMITADO
              </Badge>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-glowe-dark">Glow Deals 💛</h2>
              <p className="text-sm text-glowe-dark/80 max-w-lg">
                Descuentos especiales de hasta{' '}
                <span className="font-bold text-rose-600">30% OFF</span> en una selección de tus productos
                favoritos. ¡Disfrútalos antes de que se agoten!
              </p>
            </div>

            <div className="flex w-full flex-wrap items-center justify-center gap-3 rounded-2xl border border-white bg-white/70 p-4 shadow-sm backdrop-blur-md sm:w-auto">
              <span className="text-xs font-bold text-glowe-dark uppercase tracking-wider">Termina en:</span>
              <div className="flex items-center gap-2 text-glowe-dark font-bold text-sm">
                <span className="bg-glowe-dark text-white px-2.5 py-1 rounded-lg">{hours}h</span>:
                <span className="bg-glowe-dark text-white px-2.5 py-1 rounded-lg">{minutes}m</span>:
                <span className="bg-glowe-dark text-white px-2.5 py-1 rounded-lg">{seconds}s</span>
              </div>
            </div>
          </Reveal>

          {deals.length === 0 && (
            <p className="relative z-10 mt-8 text-center text-sm font-semibold text-glowe-dark" role="status">
              Pronto tendremos nuevas ofertas destacadas para ti.
            </p>
          )}

          <div className="relative z-10 mt-8 grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 sm:gap-6 xl:grid-cols-3">
            {deals.map((deal) => (
              <Card
                key={deal.productId}
                radius="2xl"
                className="p-4 bg-white/90 border-glowe-yellow-dark/60 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-glowe-offwhite">
                    <img
                      src={deal.image}
                      alt={`${deal.name} en oferta con ${deal.discount}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <Badge tone="rose" className="absolute top-2 left-2">
                      {deal.discountPercentage ? `${deal.discountPercentage}% OFF` : deal.discount}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-sm text-glowe-dark">{deal.name}</h3>
                  <p className="text-[11px] text-glowe-muted mt-1">{deal.desc}</p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-glowe-pink/30 pt-3">
                  <div>
                    <span className="text-xs text-glowe-muted line-through">
                      ${deal.oldPrice.toLocaleString('es-CO')}
                    </span>
                    <span className="block text-base font-bold text-glowe-dark">
                      ${deal.price.toLocaleString('es-CO')} COP
                    </span>
                  </div>
                  <Button size="sm" onClick={() => handleAdd(deal)} aria-label={`Añadir ${deal.name} al carrito`}>
                    Añadir
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
