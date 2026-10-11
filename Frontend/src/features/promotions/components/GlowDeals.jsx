import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useCart } from '@/features/cart'
import { useToast } from '@/shared/toast'
import { useCountdown } from '@/shared/hooks/useCountdown'
import { getGlowDeals } from '@/features/promotions/services/bundleService'
import { getProductById } from '@/features/products/services/productService'
import { ROUTES } from '@/app/routes'
import Reveal from '@/shared/components/ui/Reveal'
import Card from '@/shared/components/ui/Card'
import Badge from '@/shared/components/ui/Badge'
import Button from '@/shared/components/ui/Button'
import NewsletterForm from '@/features/newsletter'

export default function GlowDeals() {
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()
  const { showToast } = useToast()
  const [initialSeconds, setInitialSeconds] = useState(8 * 3600 + 42 * 60 + 19)

  const { hours, minutes, seconds, isExpired } = useCountdown(initialSeconds)

  useEffect(() => {
    let active = true
    setLoading(true)
    getGlowDeals()
      .then((data) => {
        if (!active) return
        const activeDeals = Array.isArray(data?.deals) ? data.deals : []
        setDeals(activeDeals)

        // If deals have offerEndDate, sync timer to end date
        const validDealsWithEndDate = activeDeals.filter((d) => d.offerEndDate)
        if (validDealsWithEndDate.length > 0) {
          const endTimes = validDealsWithEndDate.map((d) => new Date(d.offerEndDate).getTime())
          const commonOrEarliest = Math.min(...endTimes)
          const diff = Math.floor((commonOrEarliest - Date.now()) / 1000)
          setInitialSeconds(Math.max(0, diff))
        }
      })
      .catch((err) => {
        console.warn('Error al cargar ofertas:', err)
        if (active) setDeals([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const handleAdd = async (deal) => {
    const product = await getProductById(deal.productId)
    addItem(product || {
      id: deal.productId,
      name: deal.name,
      price: deal.price,
      image: deal.image,
    })
    showToast('¡Oferta agregada! ⚡', `${deal.name} con descuento en tu carrito.`, '💛')
  }

  const hasActiveDeals = !isExpired && deals.length > 0

  // Adaptar el ancho máximo del contenedor según la cantidad de ofertas o centrar estado vacío
  const containerMaxWidth = !hasActiveDeals
    ? 'max-w-2xl'
    : deals.length === 1
    ? 'max-w-md'
    : deals.length === 2
    ? 'max-w-4xl'
    : 'max-w-7xl'

  const gridColsClass = deals.length === 1
    ? 'grid-cols-1 max-w-sm mx-auto'
    : deals.length === 2
    ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto'
    : 'grid-cols-1 min-[520px]:grid-cols-2 xl:grid-cols-3'

  return (
    <section id="glow-deals" className="py-11 relative scroll-mt-24">
      <div className={`${containerMaxWidth} mx-auto px-4 sm:px-6 lg:px-8`}>
        <div className="w-full rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-glowe-yellow/80 via-glowe-yellow-dark/40 to-glowe-pink/50 border border-glowe-yellow-dark/50 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-glowe-pink/40 rounded-full blur-3xl pointer-events-none" />

          {loading ? (
            <div className="relative z-10 py-16 flex flex-col items-center justify-center text-center space-y-4" role="status">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/60 border-t-glowe-pink-accent" />
              <p className="text-sm font-semibold text-glowe-dark/80">Cargando ofertas exclusivas de Glowe...</p>
            </div>
          ) : hasActiveDeals ? (
            <>
              <Reveal className="relative z-10 flex flex-col items-center justify-between gap-6 lg:flex-row lg:gap-8">
                <div className="text-center md:text-left space-y-2">
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

              <div className={`relative z-10 mt-8 grid gap-4 sm:gap-6 ${gridColsClass}`}>
                {deals.map((deal) => (
                  <Card
                    key={deal.productId}
                    radius="2xl"
                    className="group p-4 bg-white/90 border-glowe-yellow-dark/60 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    <Link
                      to={ROUTES.PRODUCT_DETAIL(deal.productId)}
                      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glowe-pink-accent rounded-xl"
                      title={`Ver detalle de ${deal.name}`}
                    >
                      <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-glowe-offwhite">
                        <img
                          src={deal.image}
                          alt={`${deal.name} en oferta con ${deal.discount}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <Badge tone="rose" className="absolute top-2 left-2">
                          {deal.discountPercentage ? `${deal.discountPercentage}% OFF` : deal.discount}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-sm text-glowe-dark group-hover:text-glowe-pink-accent transition-colors">
                        {deal.name}
                      </h3>
                      <p className="text-[11px] text-glowe-muted mt-1 line-clamp-2">{deal.desc}</p>
                    </Link>

                    <div className="mt-4 flex items-center justify-between border-t border-glowe-pink/30 pt-3">
                      <Link
                        to={ROUTES.PRODUCT_DETAIL(deal.productId)}
                        className="min-w-0 focus-visible:outline-none"
                      >
                        {deal.oldPrice && deal.oldPrice > deal.price && (
                          <span className="text-xs text-glowe-muted line-through block">
                            ${deal.oldPrice.toLocaleString('es-CO')}
                          </span>
                        )}
                        <span className="block text-base font-bold text-glowe-dark">
                          ${deal.price.toLocaleString('es-CO')} COP
                        </span>
                      </Link>
                      <Button
                        variant="soft"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAdd(deal)
                        }}
                        title="Agregar al Carrito"
                        aria-label={`Añadir ${deal.name} al carrito`}
                        className="h-11 w-11 shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Reveal className="relative z-10 text-center max-w-2xl mx-auto space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 text-3xl sm:text-4xl mx-auto">
                <img src="favicon.webp" alt="" />
              </div>

              <div className='relative flex flex-col gap-4'>
                <h2 className="font-serif text-2xl sm:text-4xl font-bold text-glowe-dark tracking-tight">
                  {isExpired && deals.length > 0
                    ? '¡El tiempo de las ofertas ha llegado a cero! ⏱️'
                    : '¡Nuestros descuentos flash se han agotado!'}
                </h2>
                <p className="text-sm text-glowe-dark/85 leading-relaxed max-w-xl mx-auto">
                  Esta ronda de promociones por tiempo limitado ha concluido. Nos estamos preparando para lanzar el siguiente lote con descuentos especiales de marcas oficiales (Trendy, Montoc, Ame, Olaplex)
                </p>
              </div>

              {/* Lead Capture Card */}
              <div className="rounded-2xl border border-white/90 bg-white/40 p-5 sm:p-7 shadow-lg backdrop-blur-md text-left space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">🔔</span>
                  <div>
                    <h3 className="text-base font-bold text-glowe-dark">
                      ¿Quieres enterarte antes que nadie del próximo Glow Drop?
                    </h3>
                  </div>
                </div>

                <NewsletterForm
                  id="deals-empty-email"
                  source="ofertas-empty-state"
                  placeholder="¡Ingresa tu correo para recibir las nuevas ofertas!"
                  buttonText="Avisarme de ofertas ⚡"
                  buttonVariant="gradient"
                  toastTitle="¡Anotada en la lista VIP de ofertas! ⚡"
                  toastMessage="Te enviaremos una notificación exclusiva apenas lancemos los nuevos descuentos."
                  successMessage="💚 ¡Suscripción registrada! Te avisaremos con prioridad."
                  className="pt-1"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-glowe-pink/20 text-[11px] text-glowe-muted">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span></span> Sólo te avisaremos de nuevas ofertas. 💖
                  </span>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  )
}
