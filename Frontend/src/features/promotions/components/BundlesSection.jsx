import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useCart } from '@/features/cart'
import { useToast } from '@/shared/toast'
import { getBundles } from '@/features/promotions/services/bundleService'
import Reveal from '@/shared/components/ui/Reveal'
import Card from '@/shared/components/ui/Card'
import Badge from '@/shared/components/ui/Badge'
import Button from '@/shared/components/ui/Button'
import NewsletterForm from '@/features/newsletter'

export default function BundlesSection() {
  const [bundles, setBundles] = useState([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()
  const { showToast } = useToast()

  useEffect(() => {
    let active = true
    setLoading(true)
    getBundles()
      .then((data) => {
        if (!active) return
        setBundles(data)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const handleAddToCart = (bundle) => {
    addItem({
      id: bundle.id || bundle._id,
      name: bundle.name,
      price: Number(bundle.price || 0),
      image: bundle.image,
      desc: bundle.desc,
      category: 'combos',
      isBundle: true,
    })
    showToast('¡Kit agregado! 🎁', `${bundle.name} está en tu carrito.`, '🎁')
  }

  if (loading) {
    return (
      <section id="combos" className="py-16 relative scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/70 bg-white/60 p-12 text-center shadow-sm backdrop-blur-md max-w-xl mx-auto">
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4" role="status">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/60 border-t-glowe-pink-accent" />
              <p className="text-sm font-semibold text-glowe-dark/80">Cargando combos y kits exclusivos...</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (bundles.length === 0) {
    return (
      <section id="combos" className="py-10 relative scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="rounded-[2.5rem] border border-white/70 bg-glowe-blue-dark/40 p-8 sm:p-12 text-center shadow-sm backdrop-blur-md max-w-2xl mx-auto space-y-6">
            <span className="text-3xl" role="img" aria-label="Kits">✨</span>
            <div className="space-y-2">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-glowe-dark">
                Próximamente nuevos combos
              </h3>
              <p className="text-xs sm:text-sm text-glowe-muted leading-relaxed max-w-lg mx-auto">
                Estamos preparando kits y combinaciones exclusivas para ti. ¡Vuelve pronto o revisa nuestro catálogo completo!
              </p>
            </div>

            {/* Lead Capture Card */}
            <div className="rounded-2xl border border-white/90 bg-white/50 p-5 sm:p-7 shadow-lg backdrop-blur-md text-left space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">🔔</span>
                <div>
                  <h3 className="text-base font-bold text-glowe-dark">
                    ¿Quieres enterarte antes que nadie de los nuevos Combos?
                  </h3>
                  <p className="text-xs text-glowe-muted mt-0.5">
                    Sé la primera en conocer los nuevos kits de belleza y promociones especiales.
                  </p>
                </div>
              </div>

              <NewsletterForm
                id="bundles-empty-email"
                source="combos-empty-state"
                placeholder="¡Ingresa tu correo para recibir los nuevos combos!"
                buttonText="Avisarme de combos 🎁"
                buttonVariant="gradient"
                toastTitle="¡Anotada en la lista VIP de combos! 🎁"
                toastMessage="Te avisaremos con prioridad cuando tengamos nuevos kits y combos disponibles."
                successMessage="💚 ¡Suscripción registrada! Te avisaremos con prioridad."
                className="pt-1"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-glowe-pink/20 text-[11px] text-glowe-muted">
                <span className="flex items-center gap-1.5 font-medium">
                  <span>🎁</span> Sin spam, solo los mejores kits y lanzamientos. 💖
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    )
  }

  return (
    <section id="combos" className="py-16 relative scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-glowe-pink-accent">
            Ahorra en conjunto
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-glowe-dark">
            Combos que combinan contigo 🎁
          </h2>
          <p className="text-xs sm:text-sm text-glowe-muted mt-2">
            Kits listos con tus esenciales favoritos a un precio súper especial.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bundles.map((bundle, index) => (
            <Reveal key={bundle.id} delay={index * 80}>
              <Card
                radius="3xl"
                className={`h-full p-5 ${bundle.border || 'border-glowe-pink/60'} flex flex-col justify-between`}
              >
                <div>
                  <Link
                    to={`/combos/${bundle.id}`}
                    aria-label={`Ver detalle del combo ${bundle.name}`}
                    className="mb-4 block aspect-[4/3] overflow-hidden rounded-2xl bg-glowe-offwhite focus-visible:outline focus-visible:outline-2 focus-visible:outline-glowe-pink-accent"
                  >
                    <img
                      src={bundle.image}
                      alt={`Combo ${bundle.name}: ${bundle.desc}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </Link>
                  <Badge tone="plain" className={`${bundle.badgeBg || 'bg-glowe-pink'} ${bundle.badgeText || 'text-glowe-pink-accent'}`}>
                    {bundle.badge || 'COMBO'}
                  </Badge>
                  <h3 className="font-bold text-base text-glowe-dark mt-3">
                    <Link to={`/combos/${bundle.id}`} className="hover:text-glowe-pink-accent transition-colors">
                      {bundle.name}
                    </Link>
                  </h3>
                  <p className="text-xs text-glowe-muted mt-1">{bundle.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-glowe-pink/30 flex items-center justify-between">
                  <div>
                    {bundle.oldPrice ? (
                      <span className="text-xs text-glowe-muted line-through">
                        ${bundle.oldPrice.toLocaleString('es-CO')}
                      </span>
                    ) : null}
                    <span className="block text-lg font-bold text-glowe-dark">
                      ${bundle.price.toLocaleString('es-CO')}
                    </span>
                  </div>
                  <Button
                    variant="soft"
                    size="icon"
                    onClick={() => handleAddToCart(bundle)}
                    title="Agregar al Carrito"
                    aria-label={`Agregar combo ${bundle.name} al Carrito`}
                    className="h-11 w-11"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
