import AdminModal from '@/features/admin/components/AdminModal'
import Button from '@/shared/components/ui/Button'
import Input from '@/shared/components/ui/Input'

export default function OfferModal({
  isOpen,
  onClose,
  offerForm,
  setOfferForm,
  onPriceChange,
  onSave,
  isSaving,
}) {
  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Configuración de Oferta — ${offerForm.name || 'Producto'}`}
    >
      <form onSubmit={onSave} className="space-y-4">
        {/* Header Preview */}
        <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/70 p-3">
          {offerForm.image && (
            <img
              src={offerForm.image}
              alt={offerForm.name}
              className="h-12 w-12 rounded-xl object-cover bg-slate-100 shrink-0"
            />
          )}
          <div className="min-w-0">
            <p className="font-bold text-glowe-dark text-sm truncate">{offerForm.name}</p>
            <p className="text-[10px] uppercase tracking-wider text-glowe-pink-accent font-semibold">
              {offerForm.brand}
            </p>
          </div>
        </div>

        {/* Toggle oferta activa */}
        <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/70 p-3.5">
          <div>
            <p className="text-xs font-bold text-glowe-dark">¿Habilitar oferta activa para este producto?</p>
            <p className="text-[10px] text-glowe-muted">Si está activada, se mostrará con precio tachado y etiqueta de descuento.</p>
          </div>
          <button
            type="button"
            onClick={() => setOfferForm((prev) => ({ ...prev, isOffer: !prev.isOffer }))}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              offerForm.isOffer ? 'bg-gradient-to-r from-pink-500 to-amber-500' : 'bg-slate-200'
            }`}
            role="switch"
            aria-checked={Boolean(offerForm.isOffer)}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                offerForm.isOffer ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Price and discount fields */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-glowe-muted">
              Precio Regular / Anterior (COP)
            </label>
            <Input
              type="number"
              min="0"
              value={offerForm.oldPrice}
              onChange={(e) => onPriceChange('oldPrice', e.target.value)}
              placeholder="55000"
              className="w-full text-xs"
              required={offerForm.isOffer}
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-glowe-muted">
              % Descuento
            </label>
            <Input
              type="number"
              min="1"
              max="99"
              value={offerForm.discountPercentage}
              onChange={(e) => onPriceChange('discountPercentage', e.target.value)}
              placeholder="20"
              className="w-full text-xs"
              required={offerForm.isOffer}
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-glowe-muted">
              Precio Oferta (Final COP)
            </label>
            <Input
              type="number"
              min="0"
              value={offerForm.price}
              onChange={(e) => onPriceChange('price', e.target.value)}
              placeholder="44000"
              className="w-full text-xs font-bold text-glowe-pink-accent"
              required={offerForm.isOffer}
            />
          </div>
        </div>

        {/* Date fields */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-glowe-muted">
              Fecha Inicio (Opcional)
            </label>
            <Input
              type="date"
              value={offerForm.offerStartDate}
              onChange={(e) => setOfferForm((prev) => ({ ...prev, offerStartDate: e.target.value }))}
              className="w-full text-xs"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-glowe-muted">
              Fecha Límite / Vencimiento
            </label>
            <Input
              type="date"
              value={offerForm.offerEndDate}
              onChange={(e) => setOfferForm((prev) => ({ ...prev, offerEndDate: e.target.value }))}
              className="w-full text-xs"
            />
          </div>
        </div>

        {/* Featured offer in Glow Deals */}
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/50 p-3.5">
          <input
            id="offer-is-featured"
            type="checkbox"
            checked={Boolean(offerForm.isFeaturedOffer)}
            onChange={(e) => setOfferForm((prev) => ({ ...prev, isFeaturedOffer: e.target.checked }))}
            className="h-4 w-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
          />
          <label htmlFor="offer-is-featured" className="text-xs font-semibold text-glowe-dark cursor-pointer">
            ⭐ Destacar en el carrusel principal (Glow Deals — Máx. 3 productos)
          </label>
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="glass" fullWidth type="button" onClick={onClose} className="sm:w-auto">
            Cancelar
          </Button>
          <Button
            variant="gradient"
            fullWidth
            type="submit"
            loading={isSaving}
            disabled={isSaving}
            className="sm:w-auto font-bold"
          >
            Guardar oferta ⚡
          </Button>
        </div>
      </form>
    </AdminModal>
  )
}
