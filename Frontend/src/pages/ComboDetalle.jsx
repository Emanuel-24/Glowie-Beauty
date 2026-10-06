import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Orbit } from '@uiball/loaders'
import { getComboById, getProductById } from '@/services/api'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { usePageMeta } from '@/hooks'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

const priceLabel = (value) => `$${Number(value).toLocaleString('es-CO')}`

const savingsPercent = (combo) => {
  if (!combo?.oldPrice || !combo?.price) return null
  return Math.round(((combo.oldPrice - combo.price) / combo.oldPrice) * 100)
}

export default function ComboDetalle() {
  const { id } = useParams()
  const { addItem } = useCart()
  const { showToast } = useToast()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  usePageMeta({
    title: data?.combo ? `Combo ${data.combo.name}` : 'Combo',
    description: data?.combo?.desc,
    image: data?.combo?.image,
  })

  useEffect(() => {
    let active = true
    setLoading(true)

    getComboById(id)
      .then((result) => {
        if (!active) return
        setData(result)
        setLoading(false)
      })
      .catch(() => {
        if (!active) return
        setData(null)
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id])

  const handleBuy = async () => {
    if (!data?.combo) return
    const product = await getProductById(data.combo.productId)
    if (!product) {
      showToast('No pudimos agregar el combo', 'Inténtalo de nuevo en unos segundos.')
      return
    }
    addItem(product)
    showToast('¡Kit agregado!', `${data.combo.name} está en tu carrito.`, '🎁')
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-3 rounded-[2rem] border border-white/70 bg-white/70 px-8 py-6 shadow-xl backdrop-blur-md">
          <Orbit size={34} color="#ff758f" speed={1.4} />
          <span className="text-sm font-semibold text-glowe-muted">Cargando combo...</span>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="max-w-md mx-auto p-8 text-center">
          <h1 className="font-serif text-2xl font-bold text-glowe-dark mb-2">Combo no encontrado</h1>
          <p className="text-sm text-glowe-muted mb-6">El combo que buscas no existe o ya no está disponible.</p>
          <Link
            to="/combos"
            className="inline-block rounded-full bg-glowe-pink-accent px-8 py-3 text-xs font-bold text-white shadow-md transition-colors hover:bg-rose-500"
          >
            Ver todos los combos
          </Link>
        </Card>
      </section>
    )
  }

  const { combo, items } = data
  const percent = savingsPercent(combo)

  return (
    <section className="py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav aria-label="Migas de pan" className="mb-6 text-xs sm:text-sm">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <li>
              <Link to="/" className="text-glowe-muted hover:text-glowe-pink-accent transition-colors">
                Inicio
              </Link>
            </li>
            <li aria-hidden="true" className="text-glowe-muted">/</li>
            <li>
              <Link to="/combos" className="text-glowe-muted hover:text-glowe-pink-accent transition-colors">
                Combos
              </Link>
            </li>
            <li aria-hidden="true" className="text-glowe-muted">/</li>
            <li aria-current="page" className="font-semibold text-glowe-dark">
              {combo.name}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <Card radius="3xl" className="overflow-hidden p-0 self-start">
            <img
              src={combo.image}
              alt={`Combo ${combo.name}: todos los productos incluidos, ${combo.desc}`}
              className="aspect-square w-full object-cover"
            />
          </Card>

          <div className="flex flex-col gap-5">
            <Badge tone="plain" className={`${combo.badgeBg} ${combo.badgeText} self-start`}>
              {combo.label}
            </Badge>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-glowe-dark">{combo.name}</h1>
            <p className="text-sm sm:text-base text-glowe-muted leading-relaxed">{combo.desc}</p>

            <Card variant="glass" className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="flex flex-wrap items-end gap-2">
                <span className="text-sm text-glowe-muted line-through">{priceLabel(combo.oldPrice)}</span>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-glowe-dark">
                  {priceLabel(combo.price)}
                </span>
                {percent && <Badge tone="amber">-{percent}%</Badge>}
              </div>
              <span className="text-xs font-bold text-emerald-600">Disponible bajo pedido</span>
            </Card>

            <Button variant="gradient" fullWidth onClick={handleBuy} className="sm:w-auto">
              Agregar combo al carrito
            </Button>
          </div>
        </div>

        {items.length > 0 && (
          <section aria-labelledby="combo-incluye" className="mt-12">
            <h2 id="combo-incluye" className="font-serif text-2xl font-bold text-glowe-dark">
              Qué incluye este combo
            </h2>
            <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((item) => (
                <li key={item.id}>
                  <Link to={`/producto/${item.id}`} className="group block">
                    <Card className="overflow-hidden p-0">
                      <img
                        src={item.image}
                        alt={`${item.name}, producto incluido en el combo ${combo.name}`}
                        loading="lazy"
                        className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Card>
                    <h3 className="mt-2 text-sm font-bold text-glowe-dark transition-colors group-hover:text-glowe-pink-accent">
                      {item.name}
                    </h3>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </section>
  )
}
