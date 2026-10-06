import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Orbit } from '@uiball/loaders'
import { Heart } from 'lucide-react'
import { getProductById, getProducts } from '../services/api'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import { useToast } from '../context/ToastContext'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import PillGroup from '../components/ui/PillGroup'
import QuantityStepper from '../components/ui/QuantityStepper'
import ProductGrid from '../components/sections/ProductGrid'
import ProductCard from '../components/sections/ProductCard'
import { variantOptionsFor, detailsFor } from '../data/variants'
import { usePageMeta } from '@/hooks'

const normalizeProduct = (rawProduct) => {
  if (!rawProduct || typeof rawProduct !== 'object') return null

  const images = Array.isArray(rawProduct.images) ? rawProduct.images.filter(Boolean) : []
  const image = rawProduct.image || images[0] || ''
  const id = rawProduct.id ?? rawProduct._id ?? rawProduct.productId ?? null

  return {
    ...rawProduct,
    id,
    _id: rawProduct._id ?? id ?? null,
    name: rawProduct.name ?? rawProduct.title ?? 'Producto Glowe',
    title: rawProduct.title ?? rawProduct.name ?? 'Producto Glowe',
    brand: rawProduct.brand || 'Glowe Select',
    category: rawProduct.category ?? 'maquillaje',
    image,
    images: images.length > 0 ? images : image ? [image] : [],
    desc: rawProduct.desc ?? rawProduct.description ?? '',
    description: rawProduct.description ?? rawProduct.desc ?? '',
    tags: Array.isArray(rawProduct.tags) ? rawProduct.tags : [],
    price: Number(rawProduct.price ?? 0),
    oldPrice: rawProduct.oldPrice != null ? Number(rawProduct.oldPrice) : null,
    rating: Number(rawProduct.rating ?? 4.8),
    badge: rawProduct.badge ?? '',
  }
}

const categoryOptionLabel = (category) => {
  if (category === 'maquillaje') return 'Maquillaje'
  if (category === 'cabello') return 'Cabello'
  return 'Descubrir'
}

const categoryRouteFor = (category) => {
  if (category === 'maquillaje') return '/maquillaje'
  if (category === 'cabello') return '/cabello'
  return '/descubrir'
}

const priceLabel = (value) => `$${Number(value).toLocaleString('es-CO')}`

const discountPercent = (product) => {
  if (!product || !product.oldPrice || !product.price) return null
  return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
}

function RoutineCarousel({ items }) {
  const [index, setIndex] = useState(0)
  const visibleItems = items.slice(index, index + 2)

  const canGoPrev = index > 0
  const canGoNext = index + 2 < items.length

  if (!items.length) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="h-px flex-1 bg-white/70" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIndex((current) => Math.max(0, current - 2))}
            disabled={!canGoPrev}
            aria-label="Ver productos anteriores"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/75 text-lg text-glowe-dark shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => setIndex((current) => Math.min(items.length - 2, current + 2))}
            disabled={!canGoNext}
            aria-label="Ver más productos"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/75 text-lg text-glowe-dark shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {visibleItems.map((product) => (
          <div key={product.id} className="min-w-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Producto() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { addItem } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { showToast } = useToast()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [qty, setQty] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState('')
  const [selectedImage, setSelectedImage] = useState(0)
  const [related, setRelated] = useState([])

  usePageMeta({
    title: product ? product.name : 'Detalle de Producto',
    description: product ? product.desc || product.description : 'Descubre los detalles de este producto en GLOWE BEAUTY.',
    image: product ? product.image : undefined,
  })

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(false)

    if (!id) {
      setLoading(false)
      return () => {
        active = false
      }
    }

    getProductById(id)
      .then((result) => {
        if (!active) return
        const nextProduct = normalizeProduct(result)
        setProduct(nextProduct)
        setLoading(false)
        setError(!nextProduct)
      })
      .catch(() => {
        if (!active) return
        setError(true)
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    let active = true
    if (product) {
      getProducts()
        .then((all) => {
          if (!active) return
          const siblings = all.filter(
            (p) => p.category === product.category && p.id !== product.id,
          )
          setRelated(siblings.slice(0, 4))
        })
        .catch(() => {
          if (active) setRelated([])
        })
    }
    return () => {
      active = false
    }
  }, [product])

  useEffect(() => {
    setSelectedImage(0)
  }, [product?.id])

  const handleToggleFavorite = () => {
    if (!product) return
    const added = toggleFavorite(product.id)
    showToast(
      added ? 'Guardado en Favoritos' : 'Quitado de Favoritos',
      `${product.name} ${added ? 'se sumo a tus favoritos.' : 'fue removido.'}`,
      added ? 'heart' : 'heart-empty',
    )
  }

  const handleAddToCart = () => {
    if (!product) return
    Array.from({ length: qty }).forEach(() => addItem(product))
    showToast('Agregado al Carrito', `${qty} x ${product.name}`, 'cart')
    navigate('/')
  }

  const galleryImages = useMemo(() => {
    if (!product) return []
    const unique = [...new Set([product.image, ...(product.images || [])].filter(Boolean))]
    return unique.length > 0 ? unique : [product.image].filter(Boolean)
  }, [product])

  const isFav = product ? isFavorite(product.id) : false
  const percent = product ? discountPercent(product) : null
  const detailsInfo = useMemo(() => (product ? detailsFor(product) : null), [product])

  const relatedTitle = useMemo(
    () => (product ? `Completa tu rutina de ${categoryOptionLabel(product.category)}` : ''),
    [product],
  )

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-3 rounded-[2rem] border border-white/70 bg-white/70 px-8 py-6 shadow-xl backdrop-blur-md">
          <Orbit size={34} color="#ff758f" speed={1.4} />
          <span className="text-sm font-semibold text-glowe-muted">Cargando producto...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" role="alert">
        <Card className="max-w-md mx-auto p-8 text-center">
          <h1 className="font-serif text-2xl font-bold text-glowe-dark mb-2">Ups, algo salio mal</h1>
          <p className="text-sm text-glowe-muted mb-6">No pudimos cargar este producto. Intenta de nuevo.</p>
          <Button variant="glass" onClick={() => navigate('/descubrir')}>
            Volver al catalogo
          </Button>
        </Card>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md mx-auto p-8 text-center">
          <h1 className="font-serif text-2xl font-bold text-glowe-dark mb-2">Producto no encontrado</h1>
          <p className="text-sm text-glowe-muted mb-6">El producto que buscas no existe o fue removido.</p>
          <Button variant="glass" onClick={() => navigate('/descubrir')}>
            Explorar el catalogo
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav aria-label="Migas de pan" className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm">
          <button onClick={() => navigate('/')} className="text-glowe-muted hover:text-glowe-pink-accent transition-colors">
            Inicio
          </button>
          <span className="text-glowe-muted">/</span>
          <button
            onClick={() => navigate(categoryRouteFor(product.category))}
            className="text-glowe-muted hover:text-glowe-pink-accent transition-colors"
          >
            {categoryOptionLabel(product.category)}
          </button>
          <span className="text-glowe-muted">/</span>
          <span className="min-w-0 break-words font-semibold text-glowe-dark">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="relative">
            <Card radius="3xl" className="overflow-hidden p-0 lg:sticky lg:top-28">
              <div className="relative">
                <img
                  src={galleryImages[selectedImage] || product.image}
                  alt={product.name}
                  className="w-full aspect-square object-cover"
                />
                {product.badge && (
                  <Badge tone="pink" className="absolute top-4 left-4">
                    {product.badge}
                  </Badge>
                )}
              </div>

              {galleryImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-2 sm:p-3">
                  {galleryImages.map((image, index) => (
                    <button
                      key={`${product.id}-thumb-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      className={`overflow-hidden rounded-xl border transition-all ${
                        selectedImage === index ? 'border-glowe-pink-accent ring-2 ring-glowe-pink-soft' : 'border-white/80'
                      }`}
                      aria-label={`Ver imagen ${index + 1} de ${product.name}`}
                    >
                      <img src={image} alt={`${product.name} vista ${index + 1}`} className="h-14 w-full object-cover sm:h-16" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-glowe-pink-accent">
                {categoryOptionLabel(product.category)}
              </span>
              <button
                onClick={handleToggleFavorite}
                aria-label={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                title={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                  isFav ? 'text-glowe-pink-accent' : 'text-glowe-muted hover:text-glowe-pink-accent'
                }`}
              >
                <Heart className="w-5 h-5" fill={isFav ? 'currentColor' : 'none'} />
                {isFav ? 'En favoritos' : 'Guardar'}
              </button>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-glowe-dark">{product.name}</h1>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge tone="white" className="border border-glowe-pink-accent/30 font-bold text-glowe-dark">
                Marca: {product.brand || 'Glowe Select'}
              </Badge>
              <Badge tone="gold">{categoryOptionLabel(product.category)}</Badge>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                ✓ 100% Original · Distribuido por Glowe Beauty
              </span>
            </div>

            {product.tags && product.tags.length > 0 && (
              <PillGroup
                options={product.tags.map((t) => ({ value: t, label: t }))}
                activeValue={null}
                onChange={() => {}}
                ariaLabel="Etiquetas del producto"
                containerClassName="flex-wrap gap-2"
                className="rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-glowe-dark shadow-sm pointer-events-none"
              />
            )}

            <p className="text-sm sm:text-base text-glowe-muted leading-relaxed">{product.desc}</p>

            {detailsInfo && (
              <details className="group mt-4 rounded-2xl border border-glowe-pink-soft bg-white/70">
                <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm font-bold text-glowe-dark">
                  <span>Detalles de {product.name}</span>
                  <span aria-hidden="true" className="transition-transform group-open:rotate-180">v</span>
                </summary>
                <div className="space-y-4 px-4 pb-4 pt-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-glowe-muted mb-2">Ingredientes</h3>
                    {detailsInfo?.ingredients?.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1 text-sm text-glowe-muted">
                        {detailsInfo.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                      </ul>
                    ) : (
                      <p className="text-sm text-glowe-muted">Informacion de ingredientes no disponible para esta categoria.</p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-glowe-muted mb-2">Como usarlo</h3>
                    <p className="text-sm text-glowe-muted leading-relaxed">{detailsInfo.tips || 'Sigue las indicaciones del empaque.'}</p>
                  </div>
                </div>
              </details>
            )}

            {product && variantOptionsFor(product) && (
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-glowe-muted">
                  {variantOptionsFor(product).kind}
                </p>
                <PillGroup
                  options={variantOptionsFor(product).options.map((o) => ({ value: o, label: o }))}
                  activeValue={selectedVariant}
                  onChange={setSelectedVariant}
                  ariaLabel={`Selecciona ${variantOptionsFor(product).kind}`}
                />
              </div>
            )}

            <Card variant="glass" className="flex items-center justify-between gap-4 flex-wrap p-4">
              <div className="flex items-end gap-2 flex-wrap">
                {product.oldPrice && (
                  <span className="text-sm text-glowe-muted line-through">{priceLabel(product.oldPrice)}</span>
                )}
                <span className="text-2xl sm:text-3xl font-serif font-bold text-glowe-dark">
                  {priceLabel(product.price)}
                </span>
                {percent && <Badge tone="amber">-{percent}%</Badge>}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500" aria-label="Stock disponible">
                <span aria-hidden="true">●</span> En stock
              </div>
            </Card>

            <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-center sm:gap-4">
              <QuantityStepper
                value={qty}
                min={1}
                max={99}
                onDecrease={() => setQty((q) => Math.max(1, q - 1))}
                onIncrease={() => setQty((q) => q + 1)}
                onChange={(nextQty) => setQty(Math.max(1, Number(nextQty) || 1))}
              />
              <Button variant="gradient" fullWidth onClick={handleAddToCart} className="min-[420px]:w-auto">
                Agregar al Carrito
              </Button>
            </div>

            {related.length > 0 && (
              <div className="mt-6">
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-glowe-pink-accent">Los favoritos de tu rutina</p>
                  <h2 className="mt-2 font-serif text-2xl font-bold text-glowe-dark">{relatedTitle}</h2>
                </div>
                <RoutineCarousel items={related} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
