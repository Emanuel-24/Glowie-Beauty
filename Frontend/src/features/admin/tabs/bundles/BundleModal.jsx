import AdminModal from '@/features/admin/components/AdminModal'
import Button from '@/shared/components/ui/Button'
import Input from '@/shared/components/ui/Input'

export default function BundleModal({
  isOpen,
  onClose,
  isEditing,
  bundleForm,
  setBundleForm,
  products = [],
  onSubmit,
  isSubmitting = false,
}) {
  const toggleProduct = (productId) => {
    setBundleForm((prev) => {
      const current = Array.isArray(prev.productIds) ? prev.productIds : []
      const exists = current.includes(productId)
      return {
        ...prev,
        productIds: exists ? current.filter((id) => id !== productId) : [...current, productId],
      }
    })
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Combo / Kit' : 'Crear Nuevo Combo / Kit'}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
              Nombre del combo
            </label>
            <Input
              name="name"
              value={bundleForm.name}
              onChange={(e) => setBundleForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Glow Starter Box"
              className="w-full"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
              Precio Especial (COP)
            </label>
            <Input
              type="number"
              value={bundleForm.price}
              onChange={(e) => setBundleForm((prev) => ({ ...prev, price: e.target.value }))}
              placeholder="79000"
              className="w-full"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
              Precio Regular / Anterior (COP)
            </label>
            <Input
              type="number"
              value={bundleForm.oldPrice}
              onChange={(e) => setBundleForm((prev) => ({ ...prev, oldPrice: e.target.value }))}
              placeholder="95000"
              className="w-full"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
              Etiqueta / Badge
            </label>
            <Input
              value={bundleForm.badge}
              onChange={(e) => setBundleForm((prev) => ({ ...prev, badge: e.target.value }))}
              placeholder="TOP BUNDLE, HAIR CARE, etc."
              className="w-full"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
              URL Imagen
            </label>
            <Input
              value={bundleForm.image}
              onChange={(e) => setBundleForm((prev) => ({ ...prev, image: e.target.value }))}
              placeholder="https://..."
              className="w-full"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
              Descripción del Kit
            </label>
            <textarea
              value={bundleForm.desc}
              onChange={(e) => setBundleForm((prev) => ({ ...prev, desc: e.target.value }))}
              placeholder="Detalla qué productos incluye este combo..."
              rows={3}
              className="glass-input w-full rounded-2xl p-3 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
              Productos integrantes del kit ({bundleForm.productIds?.length || 0} seleccionados)
            </label>
            {products.length === 0 ? (
              <p className="text-xs text-glowe-muted py-2 italic">
                No hay productos en catálogo para vincular. El combo puede crearse de forma independiente.
              </p>
            ) : (
              <div className="max-h-44 overflow-y-auto rounded-2xl border border-white/60 bg-white/40 p-2 space-y-1">
                {products.map((prod) => {
                  const prodId = prod.id || prod._id
                  const isSelected = bundleForm.productIds?.includes(prodId)
                  return (
                    <label
                      key={prodId}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs cursor-pointer transition ${
                        isSelected ? 'bg-pink-100/80 font-semibold text-glowe-pink-accent' : 'hover:bg-white/60 text-glowe-dark'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleProduct(prodId)}
                        className="rounded border-slate-300 text-glowe-pink-accent focus:ring-glowe-pink-accent"
                      />
                      <span className="flex-1 truncate">{prod.name} ({prod.brand || 'Glowe'})</span>
                      <span className="text-[11px] text-glowe-muted">${Number(prod.price || 0).toLocaleString('es-CO')}</span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="glass" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button variant="gradient" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Combo'}
          </Button>
        </div>
      </form>
    </AdminModal>
  )
}
