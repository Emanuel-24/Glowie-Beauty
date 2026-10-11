import { useState, useMemo } from 'react'
import DataTable from '@/features/admin/components/DataTable'
import ActionButton from '@/features/admin/components/ActionButton'
import StatusBadge from '@/features/admin/components/StatusBadge'
import { createBundle, updateBundle, deleteBundle } from '@/features/promotions/services/bundleService'
import { exportToExcel, exportToPdf } from '@/features/admin/services/reportService'
import { formatCOP, emptyBundleForm } from '@/features/admin/constants'
import { useToast } from '@/shared/toast'
import BundleModal from './BundleModal'

export default function BundlesTab({
  bundles = [],
  setBundles,
  products = [],
  searchValue = '',
  onSearchChange,
}) {
  const { showToast } = useToast()
  const [localSearch, setLocalSearch] = useState('')
  const [bundleModalOpen, setBundleModalOpen] = useState(false)
  const [editingBundleId, setEditingBundleId] = useState(null)
  const [bundleForm, setBundleForm] = useState(emptyBundleForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentSearch = onSearchChange ? searchValue : localSearch
  const handleSearch = onSearchChange || setLocalSearch

  const bundleRows = useMemo(
    () =>
      bundles.map((bundle, index) => {
        const id = bundle.id || bundle._id
        const productCount = Array.isArray(bundle.productIds) ? bundle.productIds.length : 0
        return {
          id: id ?? `bundle-${index}`,
          rawId: id,
          number: String(index + 1).padStart(2, '0'),
          name: bundle.name || 'Combo Glowe',
          image: bundle.image || '',
          desc: bundle.desc || '',
          badge: bundle.badge || 'COMBO',
          price: formatCOP(bundle.price),
          priceValue: Number(bundle.price || 0),
          oldPrice: bundle.oldPrice ? formatCOP(bundle.oldPrice) : null,
          oldPriceValue: bundle.oldPrice ? Number(bundle.oldPrice) : null,
          productCount,
          productCountLabel: `${productCount} productos`,
          rawBundle: bundle,
        }
      }),
    [bundles],
  )

  const openBundleModal = (bundle = null) => {
    if (bundle) {
      const bId = bundle.id || bundle._id
      setEditingBundleId(bId)
      setBundleForm({
        name: bundle.name || '',
        desc: bundle.desc || '',
        price: String(bundle.price ?? ''),
        oldPrice: bundle.oldPrice != null ? String(bundle.oldPrice) : '',
        image: bundle.image || '',
        badge: bundle.badge || 'TOP BUNDLE',
        productIds: Array.isArray(bundle.productIds)
          ? bundle.productIds.map((p) => (typeof p === 'object' && p ? p.id || p._id : p))
          : [],
      })
    } else {
      setEditingBundleId(null)
      setBundleForm(emptyBundleForm)
    }
    setBundleModalOpen(true)
  }

  const handleDeleteBundle = async (id) => {
    if (!id) return
    if (typeof window !== 'undefined' && window.confirm) {
      if (!window.confirm('¿Eliminar este combo permanentemente?')) return
    }

    try {
      const result = await deleteBundle(id)
      if (result?.ok === false) {
        showToast('Error', 'No se pudo eliminar el combo.', '❌')
        return
      }

      setBundles?.((prev) => prev.filter((item) => (item.id ?? item._id) !== id))
      showToast('Combo eliminado', 'Se retiró el paquete correctamente.', '🗑️')
    } catch (err) {
      showToast('Error', err.message || 'No se pudo eliminar el combo.', '❌')
    }
  }

  const handleBundleSubmit = async (event) => {
    event.preventDefault()
    if (!bundleForm.name.trim()) {
      showToast('Error', 'El nombre del combo es obligatorio.', '⚠️')
      return
    }

    const payload = {
      name: bundleForm.name.trim(),
      desc: bundleForm.desc.trim(),
      price: Number(bundleForm.price) || 0,
      oldPrice: bundleForm.oldPrice ? Number(bundleForm.oldPrice) : null,
      image: bundleForm.image.trim() || 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
      badge: bundleForm.badge.trim() || 'TOP BUNDLE',
      productIds: bundleForm.productIds || [],
    }

    setIsSubmitting(true)
    try {
      if (editingBundleId) {
        const updated = await updateBundle(editingBundleId, payload)
        setBundles?.((prev) =>
          prev.map((item) => ((item.id ?? item._id) === editingBundleId ? { ...item, ...updated } : item)),
        )
        showToast('Combo actualizado', 'Los cambios se guardaron con éxito.', '✅')
      } else {
        const created = await createBundle(payload)
        setBundles?.((prev) => [created, ...prev])
        showToast('Combo creado', 'El nuevo kit se agregó al catálogo.', '✨')
      }

      setBundleModalOpen(false)
      setBundleForm(emptyBundleForm)
      setEditingBundleId(null)
    } catch (err) {
      showToast('Error', err.message || 'No se pudo guardar el combo.', '❌')
    } finally {
      setIsSubmitting(false)
    }
  }

  const bundleColumns = [
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
      header: 'Combo y Detalle',
      render: (row) => (
        <div>
          <p className="font-semibold text-glowe-dark">{row.name}</p>
          <p className="text-[10px] uppercase tracking-[0.14em] text-glowe-pink-accent font-bold">
            {row.badge} • <span className="text-glowe-muted">{row.productCountLabel}</span>
          </p>
          {row.desc && <p className="text-xs text-glowe-muted line-clamp-1 mt-0.5">{row.desc}</p>}
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Precio',
      render: (row) => (
        <div>
          {row.oldPrice && <span className="block text-[10px] text-glowe-muted line-through">{row.oldPrice}</span>}
          <span className="font-bold text-glowe-dark">{row.price}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <ActionButton
            type="edit"
            title="Editar combo"
            onClick={() => openBundleModal(row.rawBundle || row)}
          >
            Editar
          </ActionButton>
          <ActionButton
            type="delete"
            title="Eliminar combo"
            onClick={() => handleDeleteBundle(row.rawId || row.id)}
          >
            Eliminar
          </ActionButton>
        </div>
      ),
    },
  ]

  const handleExport = (type) => {
    const payload = bundleRows.map((row) => ({
      Nombre: row.name,
      Precio: row.priceValue,
      PrecioAnterior: row.oldPriceValue || 'N/A',
      ProductosIncluidos: row.productCount,
      Badge: row.badge,
    }))

    if (type === 'excel') {
      exportToExcel({ title: 'reporte-combos', payload })
    } else {
      exportToPdf({ title: 'reporte-combos', moduleTitle: 'Combos y Kits', payload })
    }
  }

  return (
    <>
      <DataTable
        title="Combos y Kits"
        rows={bundleRows}
        columns={bundleColumns}
        searchValue={currentSearch}
        onSearchChange={handleSearch}
        primaryActionLabel="+ Crear combo"
        onPrimaryAction={() => openBundleModal(null)}
        onExportPdf={() => handleExport('pdf')}
        onExportExcel={() => handleExport('excel')}
      />

      <BundleModal
        isOpen={bundleModalOpen}
        onClose={() => setBundleModalOpen(false)}
        isEditing={Boolean(editingBundleId)}
        bundleForm={bundleForm}
        setBundleForm={setBundleForm}
        products={products}
        onSubmit={handleBundleSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  )
}
