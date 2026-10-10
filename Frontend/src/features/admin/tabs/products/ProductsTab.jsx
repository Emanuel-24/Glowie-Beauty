import { useMemo, useState } from 'react'
import DataTable from '@/features/admin/components/DataTable'
import ActionButton from '@/features/admin/components/ActionButton'
import StatusBadge from '@/features/admin/components/StatusBadge'
import { createProduct, updateProduct, deleteProduct } from '@/features/products/services/productService'
import { exportToExcel, exportToPdf } from '@/features/admin/services/reportService'
import { formatCOP, emptyProductForm } from '@/features/admin/constants'
import { useToast } from '@/shared/toast'
import ProductModal from './ProductModal'

export default function ProductsTab({
  products = [],
  setProducts,
  tags = [],
  searchValue = '',
  onSearchChange,
  onConfigureOffer,
}) {
  const { showToast } = useToast()
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState(null)
  const [productForm, setProductForm] = useState(emptyProductForm)

  const productRows = useMemo(
    () =>
      products.map((product, index) => ({
        id: product.id ?? `${product.name}-${index}`,
        rawId: product.id,
        number: String(index + 1).padStart(2, '0'),
        image: product.image,
        name: product.name,
        brand: product.brand || 'Glowe Select',
        category: product.category,
        price: formatCOP(product.price),
        priceValue: Number(product.price || 0),
        oldPrice: product.oldPrice ? formatCOP(product.oldPrice) : null,
        oldPriceValue: product.oldPrice ? Number(product.oldPrice) : null,
        stock: Number(product.stock || 0),
        stockLabel: Number(product.stock || 0) > 0 ? 'En stock' : 'Agotado',
        stockTone: Number(product.stock || 0) > 0 ? 'success' : 'danger',
        badge: product.badge || 'Nuevo',
        desc: product.desc || '',
        tags: Array.isArray(product.tags) ? product.tags : [],
        isOffer: Boolean(product.isOffer),
        discountPercentage: Number(product.discountPercentage || 0),
        rawProduct: product,
      })),
    [products],
  )

  const openProductModal = (product = null) => {
    if (product) {
      setEditingProductId(product.id)
      setProductForm({
        name: product.name || '',
        brand: product.brand || 'Glowe Select',
        category: product.category || 'maquillaje',
        price: String(product.priceValue ?? product.price ?? ''),
        stock: String(product.stock ?? 12),
        image: product.image || '',
        badge: product.badge || 'Nuevo',
        desc: product.desc || '',
        tags: Array.isArray(product.tags) ? product.tags : [],
        isRecommended: Boolean(product.isRecommended),
        recommendedOrder: String(product.recommendedOrder ?? ''),
      })
    } else {
      setEditingProductId(null)
      setProductForm(emptyProductForm)
    }
    setProductModalOpen(true)
  }

  const handleDeleteProduct = async (id) => {
    if (typeof window !== 'undefined' && window.confirm) {
      if (!window.confirm('¿Eliminar este producto del catálogo?')) return
    }

    const result = await deleteProduct(id)
    if (result?.ok === false) return

    setProducts?.((prev) => prev.filter((product) => (product.id ?? product._id) !== id))
    showToast('Producto eliminado', 'Se retiró del catálogo.', '🗑️')
  }

  const handleProductSubmit = async (event) => {
    event.preventDefault()

    const payload = {
      id: editingProductId ?? Date.now(),
      name: productForm.name.trim() || 'Nuevo producto',
      brand: (productForm.brand || 'Glowe Select').trim(),
      category: productForm.category,
      price: Number(productForm.price) || 0,
      stock: Number(productForm.stock) || 0,
      image:
        productForm.image ||
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=500&q=80',
      badge: productForm.badge || 'Nuevo',
      desc: productForm.desc || 'Producto de la colección Glowe.',
      description: productForm.desc || 'Producto de la colección Glowe.',
      tags: Array.isArray(productForm.tags) ? productForm.tags : [],
      isRecommended: Boolean(productForm.isRecommended),
      recommendedOrder: Number(productForm.recommendedOrder ?? 0),
    }

    try {
      let savedProduct
      if (editingProductId) {
        savedProduct = await updateProduct(editingProductId, payload)
        setProducts?.((prev) =>
          prev.map((item) =>
            (item.id ?? item._id) === editingProductId ? { ...item, ...savedProduct, id: editingProductId } : item,
          ),
        )
        showToast('Producto actualizado', 'Los cambios se guardaron correctamente.', '✅')
      } else {
        savedProduct = await createProduct(payload)
        setProducts?.((prev) => [{ ...savedProduct, id: savedProduct.id ?? payload.id }, ...prev])
        showToast('Producto creado', 'El producto se agregó al catálogo.', '✨')
      }

      setProductModalOpen(false)
      setProductForm(emptyProductForm)
      setEditingProductId(null)
    } catch (err) {
      showToast('Error', err.message || 'No se pudo guardar el producto.', '❌')
    }
  }

  const productColumns = [
    {
      key: 'number',
      header: '#',
      className: 'w-16',
      render: (row) => <span className="font-bold text-glowe-muted">{row.number}</span>,
    },
    {
      key: 'image',
      header: 'Imagen',
      render: (row) => (
        <img
          src={row.image}
          alt={row.name}
          className="h-12 w-12 rounded-xl object-cover ring-1 ring-glowe-pink/20"
          loading="lazy"
        />
      ),
    },
    {
      key: 'name',
      header: 'Nombre & Marca',
      render: (row) => (
        <div>
          <p className="font-semibold text-glowe-dark">{row.name}</p>
          <p className="text-[10px] uppercase tracking-[0.14em] text-glowe-pink-accent font-bold">
            {row.brand || 'Glowe Select'} • <span className="text-glowe-muted">{row.badge}</span>
          </p>
          {Array.isArray(row.tags) && row.tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {row.tags.map((tg) => (
                <span
                  key={tg}
                  className="rounded-full bg-pink-50 px-2 py-0.2 text-[9px] font-semibold text-glowe-pink-accent border border-pink-100"
                >
                  #{tg}
                </span>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Categoría',
      render: (row) => (
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-glowe-muted">
          {row.category}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Precio',
      render: (row) => (
        <div>
          {row.isOffer && row.oldPrice && (
            <span className="block text-[10px] text-glowe-muted line-through">{row.oldPrice}</span>
          )}
          <span className="font-bold text-glowe-dark">{row.price}</span>
          {row.isOffer && (
            <span className="ml-1 rounded-full bg-rose-100 px-1.5 py-0.2 text-[9px] font-bold text-rose-700">
              -{row.discountPercentage || 0}%
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (row) => <StatusBadge label={row.stockLabel} tone={row.stockTone} />,
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <ActionButton type="view" title="Ver">
            Ver
          </ActionButton>
          <ActionButton type="edit" title="Editar" onClick={() => openProductModal(row.rawProduct || row)}>
            Editar
          </ActionButton>
          <button
            type="button"
            onClick={() => onConfigureOffer?.(row.rawProduct || row)}
            className={`rounded-full px-2 py-1 text-[10px] font-bold transition shadow-sm ${
              row.isOffer
                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                : 'bg-white/90 text-glowe-muted hover:bg-amber-50 hover:text-amber-800 border border-white'
            }`}
            title="Configurar oferta y descuento"
          >
            ⚡ {row.isOffer ? 'Oferta' : '+ Oferta'}
          </button>
          <ActionButton type="delete" title="Eliminar" onClick={() => handleDeleteProduct(row.rawId || row.id)}>
            Eliminar
          </ActionButton>
        </div>
      ),
    },
  ]

  const handleExport = (type) => {
    const payload = productRows.map((row) => ({
      Nombre: row.name,
      Categoria: row.category,
      Precio: row.priceValue,
      Stock: row.stock,
      Estado: row.stockLabel,
    }))

    if (type === 'excel') {
      exportToExcel({ title: 'reporte-productos', payload })
    } else {
      exportToPdf({ title: 'reporte-productos', moduleTitle: 'Productos', payload })
    }
  }

  return (
    <>
      <DataTable
        title="Productos"
        rows={productRows}
        columns={productColumns}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        primaryActionLabel="+ Crear producto"
        onPrimaryAction={() => openProductModal()}
        onExportPdf={() => handleExport('pdf')}
        onExportExcel={() => handleExport('excel')}
      />

      <ProductModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        isEditing={Boolean(editingProductId)}
        productForm={productForm}
        setProductForm={setProductForm}
        tags={tags}
        onSubmit={handleProductSubmit}
      />
    </>
  )
}
