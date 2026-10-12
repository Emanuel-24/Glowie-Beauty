import AdminModal from '@/features/admin/components/AdminModal'
import { Button, Input, PriceInput, Select } from '@/shared/components/ui'
import ProductImageManager from '@/features/admin/components/ProductImageManager'
import { useUnsavedChangesWarning } from '@/shared/hooks/useUnsavedChangesWarning'

export default function ProductModal({
  isOpen,
  onClose,
  isEditing,
  productForm,
  setProductForm,
  categories = [],
  tags = [],
  onAddNewTag,
  onSubmit,
}) {
  useUnsavedChangesWarning(Boolean(isOpen && productForm.name))
  const categoryOptions =
    categories.length > 0
      ? categories.map((cat) => ({
          value: cat.name.toLowerCase(),
          label: cat.name,
        }))
      : [
          { value: 'maquillaje', label: 'Maquillaje' },
          { value: 'cabello', label: 'Cabello' },
          { value: 'skincare', label: 'Skincare' },
          { value: 'labios', label: 'Labios' },
        ]

  const handleAddCustomTag = async (rawVal) => {
    const val = rawVal?.trim()
    if (!val) return
    if (!(productForm.tags || []).some((item) => item.toLowerCase() === val.toLowerCase())) {
      setProductForm((prev) => ({ ...prev, tags: [...(prev.tags || []), val] }))
      // Creación automática en BD si no existe en la lista de tags
      if (onAddNewTag) {
        await onAddNewTag(val)
      }
    }
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar producto' : 'Crear producto'}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Nombre */}
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
              required
            />
          </div>

          {/* Marca */}
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

          {/* Categoría */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
              Categoría
            </label>
            <Select
              value={productForm.category}
              onChange={(event) => setProductForm((prev) => ({ ...prev, category: event.target.value }))}
              options={categoryOptions}
            />
          </div>

          {/* Precio de venta (COP) */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
              Precio de venta (COP)
            </label>
            <PriceInput
              value={productForm.price}
              onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.numericValue }))}
              placeholder="0"
              className="w-full text-xs font-semibold"
            />
          </div>

          {/* Precio coste (COP) */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
              Precio coste (COP)
            </label>
            <PriceInput
              value={productForm.costPrice}
              onChange={(e) => setProductForm((prev) => ({ ...prev, costPrice: e.numericValue }))}
              placeholder="0"
              className="w-full text-xs"
            />
          </div>

          {/* Stock */}
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

          {/* Badge */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
              Badge / Etiqueta destacada
            </label>
            <Input
              value={productForm.badge}
              onChange={(event) => setProductForm((prev) => ({ ...prev, badge: event.target.value }))}
              placeholder="Nuevo"
              className="w-full"
            />
          </div>

          {/* Gestor de Imágenes */}
          <div className="md:col-span-2">
            <ProductImageManager
              images={productForm.images || []}
              primaryImage={productForm.image || ''}
              onChange={({ images, primaryImage }) =>
                setProductForm((prev) => ({
                  ...prev,
                  images,
                  image: primaryImage,
                }))
              }
            />
          </div>

          {/* Etiquetas / Tags con Creación Automática */}
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
                        className="rounded-full border border-pink-200 bg-white/80 px-2 py-0.5 text-[11px] font-medium text-glowe-dark hover:bg-pink-50 cursor-pointer"
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
                placeholder="Escribir nueva etiqueta..."
                className="flex-1 text-xs py-1.5"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCustomTag(e.target.value)
                    e.target.value = ''
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="glass"
                onClick={() => {
                  const input = document.getElementById('new-tag-input')
                  if (input?.value) {
                    handleAddCustomTag(input.value)
                    input.value = ''
                  }
                }}
              >
                + Añadir etiqueta
              </Button>
            </div>
          </div>

          {/* Recomendado */}
          <div className="md:col-span-2 flex items-center gap-3 rounded-[1.2rem] border border-white/80 bg-white/70 px-4 py-3">
            <input
              id="product-is-recommended"
              type="checkbox"
              checked={Boolean(productForm.isRecommended)}
              onChange={(event) => setProductForm((prev) => ({ ...prev, isRecommended: event.target.checked }))}
              className="h-4 w-4 rounded border-glowe-pink-accent text-glowe-pink-accent focus:ring-glowe-pink-accent"
            />
            <label htmlFor="product-is-recommended" className="text-sm font-semibold text-glowe-dark cursor-pointer">
              Mostrar como recomendado cuando el carrito esté vacío
            </label>
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
              Descripción
            </label>
            <textarea
              value={productForm.desc}
              onChange={(event) => setProductForm((prev) => ({ ...prev, desc: event.target.value }))}
              rows="4"
              className="glass-input min-h-[100px] rounded-[1.5rem] px-4 py-3 text-sm text-glowe-dark placeholder:text-glowe-muted"
              placeholder="Describe el beneficio principal del producto"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="glass" fullWidth type="button" onClick={onClose} className="sm:w-auto">
            Cancelar
          </Button>
          <Button variant="gradient" fullWidth type="submit" className="sm:w-auto font-bold">
            {isEditing ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </div>
      </form>
    </AdminModal>
  )
}
