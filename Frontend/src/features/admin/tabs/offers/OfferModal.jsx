import { useEffect, useMemo, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import AdminModal from '@/features/admin/components/AdminModal'
import { ButtonLoading, CustomDatePicker, PriceInput } from '@/shared/components/ui'
import Button from '@/shared/components/ui/Button'
import Input from '@/shared/components/ui/Input'
import { formatCOP } from '@/features/admin/constants'
import { updateProduct } from '@/features/products/services/productService'
import { useToast } from '@/shared/toast'
import OfferProductSelector from './OfferProductSelector'
import { useUnsavedChangesWarning } from '@/shared/hooks/useUnsavedChangesWarning'

export default function OfferModal({
  isOpen,
  onClose,
  initialProduct = null,
  products = [],
  lockProductSelection = false,
  source = '',
  onSaveSuccess,
}) {
  const { showToast } = useToast()
  const [selectedProduct, setSelectedProduct] = useState(null)
  useUnsavedChangesWarning(Boolean(isOpen && selectedProduct))
  const [isOffer, setIsOffer] = useState(true)
  const [regularPrice, setRegularPrice] = useState(0)
  const [offerPrice, setOfferPrice] = useState(0)
  const [discountPercentage, setDiscountPercentage] = useState(20)
  const [offerStartDate, setOfferStartDate] = useState('')
  const [offerEndDate, setOfferEndDate] = useState('')
  const [isFeaturedOffer, setIsFeaturedOffer] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [dateError, setDateError] = useState('')

  const applyProductState = (prod) => {
    setSelectedProduct(prod)
    if (!prod) {
      setRegularPrice(0)
      setOfferPrice(0)
      setDiscountPercentage(20)
      setIsOffer(true)
      setOfferStartDate('')
      setOfferEndDate('')
      setIsFeaturedOffer(false)
      return
    }
    const reg = prod.oldPrice && prod.oldPrice > prod.price ? Number(prod.oldPrice) : Number(prod.price || 0)
    const off = prod.isOffer ? Number(prod.price) : Math.round(reg * 0.8)
    const disc = Number(prod.discountPercentage) || (reg > 0 ? Math.round(((reg - off) / reg) * 100) : 20)
    setRegularPrice(reg)
    setOfferPrice(off)
    setDiscountPercentage(disc || 20)
    setIsOffer(Boolean(prod.isOffer))
    setOfferStartDate(prod.offerStartDate ? String(prod.offerStartDate).split('T')[0] : '')
    setOfferEndDate(prod.offerEndDate ? String(prod.offerEndDate).split('T')[0] : '')
    setIsFeaturedOffer(Boolean(prod.isFeaturedOffer))
  }

  useEffect(() => {
    if (!isOpen) return
    setDateError('')
    applyProductState(initialProduct || null)
  }, [isOpen, initialProduct])

  const handleSelectProduct = (product) => applyProductState(product)

  const handleToggleOfferSwitch = () => {
    if (!isOffer) {
      if (!offerEndDate || new Date(offerEndDate) <= new Date()) {
        showToast('Fecha límite requerida', 'Debes configurar una fecha límite antes de activar la oferta', '⚠️')
        setDateError('Debes configurar una fecha límite antes de activar la oferta')
      }
      setIsOffer(true)
    } else {
      setIsOffer(false)
      setDateError('')
    }
  }

  const handleDiscountChange = (val) => {
    const pct = Math.min(99, Math.max(1, Number(val) || 0))
    setDiscountPercentage(pct)
    if (regularPrice > 0) {
      setOfferPrice(Math.round(regularPrice * (1 - pct / 100)))
    }
  }

  const handleOfferPriceChange = (val) => {
    const off = Number(val) || 0
    setOfferPrice(off)
    if (regularPrice > 0 && off > 0 && regularPrice >= off) {
      const pct = Math.min(99, Math.max(1, Math.round(((regularPrice - off) / regularPrice) * 100)))
      setDiscountPercentage(pct)
    }
  }

  const otherFeaturedCount = useMemo(() => {
    return products.filter((p) => {
      const isSame = selectedProduct && String(p.id ?? p._id) === String(selectedProduct.id ?? selectedProduct._id)
      if (isSame) return false
      return Boolean(p.isOffer && p.isFeaturedOffer)
    }).length
  }, [products, selectedProduct])

  const isGlowDealsFull = otherFeaturedCount >= 3
  const isFeaturedDisabled = !isFeaturedOffer && isGlowDealsFull
  const isLocked = Boolean(lockProductSelection || source === 'products')

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!selectedProduct) {
      showToast('Selección requerida', 'Por favor selecciona un producto para la oferta.', '⚠️')
      return
    }
    if (isOffer && (!offerEndDate || new Date(offerEndDate) <= new Date())) {
      setDateError('Debes configurar una fecha límite antes de activar la oferta')
      showToast('Fecha límite requerida', 'Debes configurar una fecha límite antes de activar la oferta', '⚠️')
      return
    }

    setDateError('')
    setIsSaving(true)

    const payload = {
      isOffer,
      oldPrice: isOffer ? regularPrice : null,
      price: isOffer ? offerPrice : regularPrice,
      salePrice: isOffer ? offerPrice : regularPrice,
      discountPercentage: isOffer ? Number(discountPercentage) : 0,
      offerStartDate: offerStartDate ? new Date(offerStartDate).toISOString() : null,
      offerEndDate: offerEndDate ? new Date(offerEndDate).toISOString() : null,
      isFeaturedOffer: Boolean(isOffer && isFeaturedOffer),
    }

    try {
      const targetId = selectedProduct.id ?? selectedProduct._id ?? selectedProduct.rawId
      const saved = await updateProduct(targetId, payload)
      showToast('Oferta guardada ⚡', `Oferta para "${selectedProduct.name}" actualizada correctamente.`, '✨')
      onSaveSuccess?.({ ...selectedProduct, ...saved, ...payload })
      onClose()
    } catch (err) {
      showToast('Error', err.message || 'No se pudo guardar la configuración de oferta.', '❌')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={selectedProduct?.isOffer ? 'Editar Oferta' : 'Crear Oferta Flash'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <OfferProductSelector
          selectedProduct={selectedProduct}
          onSelectProduct={handleSelectProduct}
          onClearProduct={() => setSelectedProduct(null)}
          products={products}
          regularPrice={regularPrice}
          lockProductSelection={isLocked}
        />

        <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/70 p-3.5">
          <div>
            <p className="text-xs font-bold text-glowe-dark">¿Habilitar oferta activa para este producto?</p>
            <p className="text-[10px] text-glowe-muted">Si está activada, se mostrará con precio tachado y etiqueta de descuento.</p>
          </div>
          <button
            type="button"
            onClick={handleToggleOfferSwitch}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              isOffer ? 'bg-gradient-to-r from-pink-500 to-amber-500' : 'bg-slate-200'
            }`}
            role="switch"
            aria-checked={Boolean(isOffer)}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                isOffer ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-glowe-muted">
              Precio actual (Referencia)
            </label>
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-xs font-bold text-glowe-dark">
              {formatCOP(regularPrice)}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-glowe-muted">
              % Descuento (1-99%)
            </label>
            <Input
              type="number"
              min="1"
              max="99"
              value={discountPercentage}
              onChange={(e) => handleDiscountChange(e.target.value)}
              placeholder="20"
              className="w-full text-xs"
              required={isOffer}
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-glowe-muted">
              Precio de oferta (Final COP)
            </label>
            <PriceInput
              value={offerPrice}
              onChange={handleOfferPriceChange}
              placeholder="40.000"
              className="w-full text-xs font-bold text-glowe-pink-accent"
              disabled={!isOffer}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-glowe-muted">
              Fecha inicio (Opcional)
            </label>
            <CustomDatePicker
              value={offerStartDate}
              onChange={(val) => setOfferStartDate(typeof val === 'string' ? val : val?.value || '')}
              placeholder="Seleccionar fecha inicio"
              className="text-xs"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-glowe-muted">
              Fecha límite / Expiración {isOffer && <span className="text-rose-500">*</span>}
            </label>
            <CustomDatePicker
              value={offerEndDate}
              onChange={(val) => {
                setOfferEndDate(typeof val === 'string' ? val : val?.value || '')
                setDateError('')
              }}
              placeholder="Seleccionar fecha límite"
              className="text-xs"
              error={Boolean(dateError)}
              errorMessage={dateError}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-3.5 space-y-2">
          <div className="flex items-center gap-3">
            <input
              id="offer-is-featured"
              type="checkbox"
              disabled={isFeaturedDisabled}
              checked={Boolean(isFeaturedOffer)}
              onChange={(e) => setIsFeaturedOffer(e.target.checked)}
              className="h-4 w-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500 disabled:opacity-40 cursor-pointer"
            />
            <label
              htmlFor="offer-is-featured"
              className={`text-xs font-semibold cursor-pointer ${
                isFeaturedDisabled ? 'text-stone-400 cursor-not-allowed' : 'text-glowe-dark'
              }`}
            >
              ⭐ Destacar en el carrusel principal (Glow Deals — Máx. 3 productos)
            </label>
          </div>

          {isFeaturedDisabled && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-100/70 p-2.5 text-[11px] text-amber-900 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
              <span>
                No hay espacio disponible en el carrusel Glow Deals (límite de 3 alcanzado). Libera un cupo en el módulo de ofertas para destacar este producto.
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-2">
          <Button variant="glass" fullWidth type="button" onClick={onClose} className="sm:w-auto">
            Cancelar
          </Button>
          <ButtonLoading
            type="submit"
            variant="gradient"
            loading={isSaving}
            disabled={isSaving || !selectedProduct}
            className="sm:w-auto font-bold"
          >
            Guardar oferta ⚡
          </ButtonLoading>
        </div>
      </form>
    </AdminModal>
  )
}
