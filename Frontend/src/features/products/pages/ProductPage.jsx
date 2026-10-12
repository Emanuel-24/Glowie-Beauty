import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Orbit } from '@uiball/loaders'
import { Heart } from 'lucide-react'
import { getProductById, getProducts } from '@/features/products/services/productService'
import { useCart } from '@/features/cart'
import { useFavorites } from '@/features/favorites'
import { useToast } from '@/shared/toast'
import Button from '@/shared/components/ui/Button'
import Badge from '@/shared/components/ui/Badge'
import Card from '@/shared/components/ui/Card'
import PillGroup from '@/shared/components/ui/PillGroup'
import QuantityStepper from '@/shared/components/ui/QuantityStepper'
import Reveal from '@/shared/components/ui/Reveal'
import ProductGallery from '@/features/products/components/ProductGallery'
import RoutineCarousel from '@/features/products/components/RoutineCarousel'
import ProductDetailsAccordion from '@/features/products/components/ProductDetailsAccordion'
import { variantOptionsFor, detailsFor } from '@/features/products/utils/variants'
import {
  normalizeProduct,
  categoryOptionLabel,
  categoryRouteFor,
  priceLabel,
  discountPercent,
} from '@/features/products/utils/productHelpers'
import { usePageMeta } from '@/shared/hooks/usePageMeta'

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

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" role="alert">
        <Card className="max-w-md mx-auto p-8 text-center">
          <h1 className="font-serif text-2xl font-bold text-glowe-dark mb-2">
            {error ? 'Ups, algo salio mal' : 'Producto no encontrado'}
          </h1>
          <p className="text-sm text-glowe-muted mb-6">
            {error ? 'No pudimos cargar este producto. Intenta de nuevo.' : 'El producto que buscas no existe o fue removido.'}
          </p>
          <Button variant="glass" onClick={() => navigate('/descubrir')}>
            {error ? 'Volver al catalogo' : 'Explorar el catalogo'}
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
          <ProductGallery
            product={product}
            galleryImages={galleryImages}
            selectedImage={selectedImage}
            onSelectImage={setSelectedImage}
          />

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
                options={product.tags.map((t) => ({ value: t, label: `#${t}` }))}
                activeValue={null}
                onChange={(t) => navigate(`/descubrir?tag=${encodeURIComponent(t)}`)}
                ariaLabel="Etiquetas del producto"
                containerClassName="flex-wrap gap-2"
                className="rounded-full border border-glowe-pink/40 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-glowe-dark shadow-xs hover:border-glowe-pink hover:bg-glowe-pink/20 hover:text-glowe-pink-accent cursor-pointer transition-all"
              />
            )}

            <p className="text-sm sm:text-base text-glowe-muted leading-relaxed">{product.desc}</p>

            <ProductDetailsAccordion product={product} detailsInfo={detailsInfo} />

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
              <Reveal delay={80} className="mt-6">
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-glowe-pink-accent">Los favoritos de tu rutina</p>
                  <h2 className="mt-2 font-serif text-2xl font-bold text-glowe-dark">{relatedTitle}</h2>
                </div>
                <RoutineCarousel items={related} />
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
