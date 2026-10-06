import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { getGlowDeals, getProductById } from '../../services/api'
import Reveal from '../ui/Reveal'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'

export default function BundlesSection() {
  const [bundles, setBundles] = useState([])
  const { addItem } = useCart()
  const { showToast } = useToast()

  useEffect(() => {
    getGlowDeals().then((data) => setBundles(data.bundles))
  }, [])

  const handleBuy = async (bundle) => {
    const product = await getProductById(bundle.productId)
    addItem(product)
    showToast('¡Kit agregado! 🎁', `${bundle.name} está en tu carrito.`, '🎁')
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
          {bundles.map((bundle) => (
            <Card
              key={bundle.id}
              radius="3xl"
              className={`p-5 ${bundle.border} flex flex-col justify-between`}
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
                <Badge tone="plain" className={`${bundle.badgeBg} ${bundle.badgeText}`}>
                  {bundle.label}
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
                  <span className="text-xs text-glowe-muted line-through">
                    ${bundle.oldPrice.toLocaleString('es-CO')}
                  </span>
                  <span className="block text-lg font-bold text-glowe-dark">
                    ${bundle.price.toLocaleString('es-CO')}
                  </span>
                </div>
                <Button
                  variant="plain"
                  size="sm"
                  onClick={() => handleBuy(bundle)}
                  aria-label={`Comprar el combo ${bundle.name}`}
                  className={`${bundle.btn} text-white`}
                >
                  Comprar Kit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
