import AdminModal from '@/features/admin/components/AdminModal'
import Button from '@/shared/components/ui/Button'
import Input from '@/shared/components/ui/Input'

export default function ProductModal({
  isOpen,
  onClose,
  isEditing,
  productForm,
  setProductForm,
  tags = [],
  onSubmit,
}) {
  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar producto' : 'Crear producto'}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
              Nombre
            </label>
            <Input
              name="name"
              value={productForm.name}
              onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Nombre del producto"
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
              Marca
            </label>
            <Input
              name="brand"
              value={productForm.brand}
              onChange={(event) => setProductForm((prev) => ({ ...prev, brand: event.target.value }))}
              placeholder="Ej: Trendy, Montoc, Ame..."
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
              Categoría
            </label>
            <select
              value={productForm.category}
              onChange={(event) => setProductForm((prev) => ({ ...prev, category: event.target.value }))}
              className="glass-input h-11 rounded-full px-4"
            >
              <option value="maquillaje">Maquillaje</option>
              <option value="cabello">Cabello</option>
              <option value="skincare">Skincare</option>
              <option value="labios">Labios</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
              Badge
            </label>
            <Input
              value={productForm.badge}
              onChange={(event) => setProductForm((prev) => ({ ...prev, badge: event.target.value }))}
              placeholder="Nuevo"
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
              Precio
            </label>
            <Input
              type="number"
              min="0"
              value={productForm.price}
              onChange={(event) => setProductForm((prev) => ({ ...prev, price: event.target.value }))}
              placeholder="38000"
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
              Stock
            </label>
            <Input
              type="number"
              min="0"
              value={productForm.stock}
              onChange={(event) => setProductForm((prev) => ({ ...prev, stock: event.target.value }))}
              className="w-full"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
              Imagen
            </label>
            <Input
              value={productForm.image}
              onChange={(event) => setProductForm((prev) => ({ ...prev, image: event.target.value }))}
              placeholder="URL de la imagen"
              className="w-full"
            />
          </div>
          <div className="md:col-span-2 rounded-[1.2rem] border border-white/80 bg-white/70 p-3.5 space-y-2.5">
            <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
              Etiquetas / Tags del Producto (ej: Ojos, Rostro, Labios, Look Natural)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(productForm.tags || []).map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-semibold text-glowe-pink-accent"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() =>
                      setProductForm((prev) => ({
                        ...prev,
                        tags: prev.tags.filter((item) => item !== t),
                      }))
                    }
                    className="ml-1 text-[11px] font-bold text-pink-600 hover:text-pink-800"
                  >
                    ×
                  </button>
                </span>
              ))}
              {(productForm.tags || []).length === 0 && (
                <span className="text-xs text-glowe-muted italic">Sin etiquetas asignadas.</span>
              )}
            </div>
            {tags.length > 0 && (
              <div className="pt-1">
                <p className="text-[10px] font-semibold uppercase text-glowe-muted mb-1">Tags disponibles para agregar:</p>
                <div className="flex flex-wrap gap-1">
                  {tags
                    .filter((tg) => !(productForm.tags || []).some((item) => item.toLowerCase() === tg.name.toLowerCase()))
                    .map((tg) => (
                      <button
                        key={tg.id || tg.name}
                        type="button"
                        onClick={() => setProductForm((prev) => ({ ...prev, tags: [...(prev.tags || []), tg.name] }))}
                        className="rounded-full border border-pink-200 bg-white/80 px-2 py-0.5 text-[11px] font-medium text-glowe-dark hover:bg-pink-50"
                      >
                        + {tg.name}
                      </button>
                    ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 pt-1">
              <Input
                id="new-tag-input"
                placeholder="Escribir etiqueta y presionar añadir..."
                className="flex-1 text-xs py-1.5"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const val = e.target.value.trim()
                    if (val && !(productForm.tags || []).some((item) => item.toLowerCase() === val.toLowerCase())) {
                      setProductForm((prev) => ({ ...prev, tags: [...(prev.tags || []), val] }))
                      e.target.value = ''
                    }
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="glass"
                onClick={() => {
                  const input = document.getElementById('new-tag-input')
                  const val = input?.value?.trim()
                  if (val && !(productForm.tags || []).some((item) => item.toLowerCase() === val.toLowerCase())) {
                    setProductForm((prev) => ({ ...prev, tags: [...(prev.tags || []), val] }))
                    if (input) input.value = ''
                  }
                }}
              >
                Añadir
              </Button>
            </div>
          </div>
          <div className="md:col-span-2 flex items-center gap-3 rounded-[1.2rem] border border-white/80 bg-white/70 px-4 py-3">
            <input
              id="product-is-recommended"
              type="checkbox"
              checked={Boolean(productForm.isRecommended)}
              onChange={(event) => setProductForm((prev) => ({ ...prev, isRecommended: event.target.checked }))}
              className="h-4 w-4 rounded border-glowe-pink-accent text-glowe-pink-accent focus:ring-glowe-pink-accent"
            />
            <label htmlFor="product-is-recommended" className="text-sm font-semibold text-glowe-dark">
              Mostrar como recomendado cuando el carrito esté vacío
            </label>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
              Orden recomendado
            </label>
            <Input
              type="number"
              min="0"
              value={productForm.recommendedOrder}
              onChange={(event) => setProductForm((prev) => ({ ...prev, recommendedOrder: event.target.value }))}
              placeholder="0"
              className="w-full"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
              Descripción
            </label>
            <textarea
              value={productForm.desc}
              onChange={(event) => setProductForm((prev) => ({ ...prev, desc: event.target.value }))}
              rows="4"
              className="glass-input min-h-[120px] rounded-[1.5rem] px-4 py-3 text-sm text-glowe-dark placeholder:text-glowe-muted"
              placeholder="Describe el beneficio principal del producto"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="glass" fullWidth type="button" onClick={onClose} className="sm:w-auto">
            Cancelar
          </Button>
          <Button variant="gradient" fullWidth type="submit" className="sm:w-auto">
            {isEditing ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </div>
      </form>
    </AdminModal>
  )
}
