import { useMemo, useState } from 'react'
import DataTable from '@/features/admin/components/DataTable'
import { useConfirm } from '@/shared/components/ui'
import { createProduct, updateProduct, deleteProduct } from '@/features/products/services/productService'
import { createTag } from '@/features/products/services/tagService'
import { exportToExcel, exportToPdf } from '@/features/admin/services/reportService'
import { formatCOP, emptyProductForm } from '@/features/admin/constants'
import { useToast } from '@/shared/toast'
import ProductModal from './ProductModal'
import ProductDetailModal from './ProductDetailModal'
import { getProductColumns } from './productColumns'

export default function ProductsTab({
  products = [],
  setProducts,
  categories = [],
  tags = [],
  setTags,
  purchases = [],
  searchValue = '',
  onSearchChange,
  onConfigureOffer,
}) {
  const { showToast } = useToast()
  const confirm = useConfirm()
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState(null)
  const [productForm, setProductForm] = useState(emptyProductForm)
  const [detailProduct, setDetailProduct] = useState(null)

  // Mapa de ventas históricas por ID de producto
  const productSalesMap = useMemo(() => {
    const map = new Map()
    purchases.forEach((order) => {
      if (String(order.status || '').toLowerCase() === 'anulada') return
      (order.items || []).forEach((item) => {
        const pId = String(item.productId ?? item.id ?? '')
        if (pId) {
          map.set(pId, (map.get(pId) || 0) + Number(item.quantity || 1))
        }
      })
    })
    return map
  }, [purchases])

  const productRows = useMemo(
    () =>
      products.map((product, index) => {
        const rawId = String(product.id ?? product._id ?? '')
        const salesCount = productSalesMap.get(rawId) || 0
        const status = product.status || 'activo'

        return {
          id: product.id ?? `${product.name}-${index}`,
          rawId,
          number: String(index + 1).padStart(2, '0'),
          image: product.image,
          name: product.name,
          brand: product.brand || 'Glowe Select',
          category: product.category,
          price: formatCOP(product.price),
          priceValue: Number(product.price || 0),
          costPrice: formatCOP(product.costPrice || 0),
          costPriceValue: Number(product.costPrice || 0),
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
          status,
          salesCount,
          rawProduct: product,
        }
      }),
    [products, productSalesMap],
  )

  const openProductModal = (product = null) => {
    if (!product) {
      setEditingProductId(null)
      setProductForm(emptyProductForm)
      setProductModalOpen(true)
      return
    }
    setEditingProductId(product.id || product.rawId)
    const imgs = Array.isArray(product.images) && product.images.length > 0
      ? product.images.slice(0, 3)
      : product.image ? [product.image] : []
    setProductForm({
      name: product.name || '',
      brand: product.brand || 'Glowe Select',
      category: product.category || 'maquillaje',
      price: product.priceValue ?? product.price ?? 0,
      costPrice: product.costPriceValue ?? product.costPrice ?? 0,
      stock: String(product.stock ?? 12),
      image: imgs[0] || product.image || '',
      images: imgs,
      badge: product.badge || 'Nuevo',
      desc: product.desc || '',
      tags: Array.isArray(product.tags) ? product.tags : [],
      isRecommended: Boolean(product.isRecommended),
      recommendedOrder: String(product.recommendedOrder ?? ''),
      status: product.status || 'activo',
    })
    setProductModalOpen(true)
  }

  // Creación automática de etiquetas inexistentes (Punto 15)
  const handleAddNewTag = async (newTagName) => {
    const exists = tags.some((t) => t.name.toLowerCase() === newTagName.toLowerCase())
    if (!exists) {
      try {
        const created = await createTag({ name: newTagName, description: '' })
        setTags?.((prev) => [...prev, created])
        showToast('Etiqueta creada', `Se registró #${created.name} automáticamente.`, '🏷️')
      } catch (err) {
        console.error('Error auto-creando tag:', err)
      }
    }
  }

  // Alternar Activo/Inactivo (Punto 9)
  const handleToggleStatus = async (product) => {
    const current = product.status || 'activo'
    if (current === 'anulado') return
    const next = current === 'activo' ? 'inactivo' : 'activo'

    try {
      await updateProduct(product.rawId || product.id, { status: next })
      setProducts?.((prev) =>
        prev.map((it) => (String(it.id ?? it._id) === String(product.rawId || product.id) ? { ...it, status: next } : it))
      )
      showToast('Estado actualizado', `El producto ahora está ${next}.`, '🔄')
    } catch (err) {
      showToast('Error', err.message || 'No se pudo cambiar el estado.', '❌')
    }
  }

  // Anulación controlada con restricción de ventas históricas (Punto 9)
  const handleAnnulProduct = async (row) => {
    if (row.salesCount > 0) {
      await confirm({
        type: 'warning',
        title: 'Acción bloqueada',
        message: `No se puede anular "${row.name}" porque tiene ${row.salesCount} venta(s) registrada(s) en el historial. Puedes marcarlo como "Inactivo" para ocultarlo de la tienda.`,
        confirmText: 'Entendido',
        showCancel: false,
      })
      return
    }

    const ok = await confirm({
      type: 'danger',
      title: '¿Anular producto?',
      message: `El producto "${row.name}" pasará a estado ANULADO. No se borrará del historial de BD pero no estará disponible para compras.`,
      confirmText: 'Sí, anular',
      cancelText: 'Cancelar',
    })

    if (!ok) return

    try {
      await deleteProduct(row.rawId || row.id)
      setProducts?.((prev) =>
        prev.map((p) => (String(p.id ?? p._id) === String(row.rawId || row.id) ? { ...p, status: 'anulado' } : p))
      )
      showToast('Producto anulado', 'El producto ha sido anulado con éxito.', '⚠️')
    } catch (err) {
      showToast('Error', err.message || 'No se pudo anular el producto.', '❌')
    }
  }

  const handleProductSubmit = async (event) => {
    event.preventDefault()
    const sanitizedImages = (Array.isArray(productForm.images) && productForm.images.length > 0
      ? productForm.images
      : [productForm.image]
    ).filter(Boolean).slice(0, 3)

    const primaryImage = sanitizedImages[0] || productForm.image ||
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=500&q=80'

    const payload = {
      id: editingProductId ?? Date.now(),
      name: productForm.name.trim() || 'Nuevo producto',
      brand: (productForm.brand || 'Glowe Select').trim(),
      category: productForm.category,
      price: Number(productForm.price) || 0,
      costPrice: Number(productForm.costPrice) || 0,
      status: productForm.status || 'activo',
      stock: Number(productForm.stock) || 0,
      image: primaryImage,
      images: sanitizedImages.length > 0 ? sanitizedImages : [primaryImage],
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
          prev.map((item) => ((item.id ?? item._id) === editingProductId ? { ...item, ...savedProduct, id: editingProductId } : item))
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

  const productColumns = useMemo(
    () =>
      getProductColumns({
        onView: (prod) => setDetailProduct(prod),
        onEdit: (prod) => openProductModal(prod),
        onConfigureOffer: (prod) => onConfigureOffer?.(prod),
        onToggleStatus: handleToggleStatus,
        onAnnul: handleAnnulProduct,
      }),
    [onConfigureOffer, products, productSalesMap, handleToggleStatus, handleAnnulProduct]
  )

  const handleExport = (type) => {
    const payload = productRows.map((row) => ({
      Nombre: row.name,
      Categoria: row.category,
      PrecioVenta: row.priceValue,
      PrecioCoste: row.costPriceValue,
      Stock: row.stock,
      Estado: row.status,
      VentasHistoricas: row.salesCount,
    }))
    if (type === 'excel') exportToExcel({ title: 'reporte-productos', payload })
    else exportToPdf({ title: 'reporte-productos', moduleTitle: 'Productos', payload })
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
        categories={categories}
        tags={tags}
        onAddNewTag={handleAddNewTag}
        onSubmit={handleProductSubmit}
      />

      <ProductDetailModal
        isOpen={Boolean(detailProduct)}
        onClose={() => setDetailProduct(null)}
        product={detailProduct}
        salesCount={detailProduct ? productSalesMap.get(String(detailProduct.id ?? detailProduct._id)) || 0 : 0}
      />
    </>
  )
}
