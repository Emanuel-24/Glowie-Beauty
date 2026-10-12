import { useState } from 'react'
import Button from '@/shared/components/ui/Button'
import Input from '@/shared/components/ui/Input'
import { updateProduct } from '@/features/products/services/productService'
import { useToast } from '@/shared/toast'
import GlowDealsBatchSection from './GlowDealsBatchSection'
import OffersKpiCards from './OffersKpiCards'
import OffersTable from './OffersTable'
import OfferModal from './OfferModal'

export default function OffersTab({
  products = [],
  setProducts,
  searchValue = '',
  onSearchChange,
}) {
  const { showToast } = useToast()
  const [offerFilter, setOfferFilter] = useState('all')
  const [offerModalOpen, setOfferModalOpen] = useState(false)
  const [editingOfferProduct, setEditingOfferProduct] = useState(null)

  const activeOffersCount = products.filter((p) => p.isOffer).length
  const featuredOffersCount = products.filter((p) => p.isOffer && p.isFeaturedOffer).length
  const avgDiscount =
    activeOffersCount > 0
      ? Math.round(
          products
            .filter((p) => p.isOffer)
            .reduce((acc, curr) => acc + (Number(curr.discountPercentage) || 0), 0) / activeOffersCount,
        )
      : 0

  const filteredOfferProducts = products.filter((p) => {
    if (offerFilter === 'active' && !p.isOffer) return false
    if (offerFilter === 'inactive' && p.isOffer) return false
    if (searchValue) {
      const q = searchValue.toLowerCase().trim()
      const matchName = (p.name || '').toLowerCase().includes(q)
      const matchBrand = (p.brand || '').toLowerCase().includes(q)
      const matchCat = (p.category || '').toLowerCase().includes(q)
      if (!matchName && !matchBrand && !matchCat) return false
    }
    return true
  })

  const openOfferModal = (product = null) => {
    setEditingOfferProduct(product)
    setOfferModalOpen(true)
  }

  const handleToggleOffer = async (product) => {
    const newOfferStatus = !product.isOffer

    if (newOfferStatus) {
      const hasValidEndDate = product.offerEndDate && new Date(product.offerEndDate) > new Date()
      if (!hasValidEndDate) {
        showToast('Fecha límite requerida', 'Debes configurar una fecha límite antes de activar la oferta', '⚠️')
        openOfferModal(product)
        return
      }
    }

    const regularPrice = product.oldPrice && product.oldPrice > product.price ? product.oldPrice : product.price
    const offerPrice = newOfferStatus
      ? product.oldPrice && product.oldPrice > product.price
        ? product.price
        : Math.round(product.price * 0.8)
      : product.price
    const discountPct = newOfferStatus
      ? product.discountPercentage || Math.round(((regularPrice - offerPrice) / regularPrice) * 100) || 20
      : 0

    const updatedPayload = {
      isOffer: newOfferStatus,
      price: offerPrice,
      oldPrice: newOfferStatus ? regularPrice : null,
      discountPercentage: discountPct,
    }

    try {
      const saved = await updateProduct(product.id, updatedPayload)
      setProducts?.((prev) =>
        prev.map((item) => (String(item.id ?? item._id) === String(product.id) ? { ...item, ...saved, ...updatedPayload } : item)),
      )
      showToast(
        newOfferStatus ? '¡Oferta activada! ⚡' : 'Oferta pausada',
        newOfferStatus ? `${product.name} ahora tiene ${discountPct}% OFF.` : `${product.name} volvió a precio regular.`,
        newOfferStatus ? '⚡' : '⏸️',
      )
    } catch {
      showToast('Error', 'No se pudo actualizar el estado de la oferta.', '❌')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-glowe-muted">
          Administra descuentos, porcentajes, vigencia y las ofertas destacadas para el escaparate público.
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="gradient"
            size="sm"
            onClick={() => openOfferModal(null)}
            className="shadow-sm"
          >
            ⚡ Configurar Nueva Oferta
          </Button>
        </div>
      </div>

      {/* Metric KPIs */}
      <OffersKpiCards
        activeOffersCount={activeOffersCount}
        featuredOffersCount={featuredOffersCount}
        avgDiscount={avgDiscount}
        totalProducts={products.length}
      />

      {/* Módulo Especial: Configuración Grupal de Glow Deals */}
      <GlowDealsBatchSection
        products={products}
        setProducts={setProducts}
        onOpenOfferModal={openOfferModal}
      />

      {/* Filters & Search toolbar */}
      <div className="flex flex-col gap-3 rounded-[1.6rem] border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: `Todos (${products.length})` },
            { id: 'active', label: `Ofertas activas (${activeOffersCount})` },
            { id: 'inactive', label: `Sin oferta (${products.length - activeOffersCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setOfferFilter(tab.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                offerFilter === tab.id
                  ? 'bg-gradient-to-r from-glowe-pink/40 to-amber-200 text-glowe-dark shadow-sm'
                  : 'bg-white/60 text-glowe-muted hover:bg-white hover:text-glowe-dark'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Buscar por producto o marca..."
            className="w-full text-xs"
          />
        </div>
      </div>

      {/* Table / List View */}
      <OffersTable
        filteredOfferProducts={filteredOfferProducts}
        onToggleOffer={handleToggleOffer}
        onOpenOfferModal={openOfferModal}
      />

      {/* Modal de edición */}
      <OfferModal
        isOpen={offerModalOpen}
        onClose={() => {
          setOfferModalOpen(false)
          setEditingOfferProduct(null)
        }}
        initialProduct={editingOfferProduct}
        products={products}
        onSaveSuccess={(savedProduct) => {
          setProducts?.((prev) =>
            prev.map((item) =>
              (item.id ?? item._id) === (savedProduct.id ?? savedProduct._id)
                ? { ...item, ...savedProduct }
                : item
            )
          )
          setOfferModalOpen(false)
          setEditingOfferProduct(null)
        }}
      />
    </div>
  )
}
