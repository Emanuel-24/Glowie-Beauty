import { useState } from 'react'
import Button from '@/shared/components/ui/Button'
import Input from '@/shared/components/ui/Input'
import { updateProduct } from '@/features/products/services/productService'
import { emptyOfferForm } from '@/features/admin/constants'
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
  const [offerForm, setOfferForm] = useState(emptyOfferForm)
  const [isSavingOffer, setIsSavingOffer] = useState(false)

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

  const openOfferModal = (product) => {
    const regular = product.oldPrice && product.oldPrice > product.price ? product.oldPrice : product.price
    const offer = product.isOffer ? product.price : Math.round(regular * 0.8)
    const discount = product.discountPercentage || Math.round(((regular - offer) / regular) * 100) || 20

    setEditingOfferProduct(product)
    setOfferForm({
      productId: product.id,
      name: product.name,
      brand: product.brand || 'Glowe Select',
      image: product.image,
      isOffer: Boolean(product.isOffer),
      oldPrice: String(regular),
      price: String(offer),
      discountPercentage: String(discount),
      offerStartDate: product.offerStartDate ? String(product.offerStartDate).split('T')[0] : '',
      offerEndDate: product.offerEndDate ? String(product.offerEndDate).split('T')[0] : '',
      isFeaturedOffer: Boolean(product.isFeaturedOffer),
    })
    setOfferModalOpen(true)
  }

  const handleOfferPriceChange = (field, val) => {
    setOfferForm((prev) => {
      const next = { ...prev, [field]: val }
      const reg = Number(field === 'oldPrice' ? val : prev.oldPrice) || 0

      if (field === 'discountPercentage') {
        const pct = Math.min(100, Math.max(0, Number(val) || 0))
        if (reg > 0) {
          next.price = String(Math.round(reg * (1 - pct / 100)))
        }
      } else if (field === 'price' || field === 'oldPrice') {
        const off = Number(field === 'price' ? val : prev.price) || 0
        if (reg > 0 && off > 0 && reg >= off) {
          next.discountPercentage = String(Math.round(((reg - off) / reg) * 100))
        }
      }
      return next
    })
  }

  const handleToggleOffer = async (product) => {
    const newOfferStatus = !product.isOffer
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
        prev.map((item) => ((item.id ?? item._id) === product.id ? { ...item, ...saved, ...updatedPayload } : item)),
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

  const handleSaveOffer = async (e) => {
    if (e) e.preventDefault()
    if (!editingOfferProduct) return

    setIsSavingOffer(true)
    const regularPrice = Number(offerForm.oldPrice) || editingOfferProduct.price
    const offerPrice = Number(offerForm.price) || Math.round(regularPrice * 0.8)
    const discountPct = Number(offerForm.discountPercentage) || 0

    const payload = {
      isOffer: Boolean(offerForm.isOffer),
      oldPrice: Boolean(offerForm.isOffer) ? regularPrice : null,
      price: Boolean(offerForm.isOffer) ? offerPrice : regularPrice,
      discountPercentage: Boolean(offerForm.isOffer) ? discountPct : 0,
      offerStartDate: offerForm.offerStartDate ? new Date(offerForm.offerStartDate).toISOString() : null,
      offerEndDate: offerForm.offerEndDate ? new Date(offerForm.offerEndDate).toISOString() : null,
      isFeaturedOffer: Boolean(offerForm.isFeaturedOffer),
    }

    try {
      const saved = await updateProduct(editingOfferProduct.id, payload)
      setProducts?.((prev) =>
        prev.map((item) =>
          (item.id ?? item._id) === editingOfferProduct.id ? { ...item, ...saved, ...payload } : item,
        ),
      )
      setOfferModalOpen(false)
      showToast('Oferta guardada ⚡', `Promoción para ${editingOfferProduct.name} actualizada correctamente.`, '✨')
    } catch {
      showToast('Error', 'No se pudo guardar la configuración de oferta.', '❌')
    } finally {
      setIsSavingOffer(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-600">
            Promociones y Descuentos Flash
          </p>
          <h1 className="font-serif text-2xl font-bold text-glowe-dark sm:text-3xl">Gestión de Ofertas ⚡</h1>
          <p className="text-xs text-glowe-muted">
            Administra descuentos, porcentajes, vigencia y las ofertas destacadas para el escaparate público.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="gradient"
            size="sm"
            onClick={() => {
              const firstWithoutOffer = products.find((p) => !p.isOffer) || products[0]
              if (firstWithoutOffer) openOfferModal(firstWithoutOffer)
            }}
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
        onClose={() => setOfferModalOpen(false)}
        offerForm={offerForm}
        setOfferForm={setOfferForm}
        onPriceChange={handleOfferPriceChange}
        onSave={handleSaveOffer}
        isSaving={isSavingOffer}
      />
    </div>
  )
}
