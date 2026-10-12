import { useState, useMemo } from 'react'
import DataTable from '@/features/admin/components/DataTable'
import AdminModal from '@/features/admin/components/AdminModal'
import ActionButton from '@/features/admin/components/ActionButton'
import StatusBadge from '@/features/admin/components/StatusBadge'
import { Button, Input, Select, useConfirm } from '@/shared/components/ui'
import { createCategory, updateCategory, deleteCategory } from '@/features/products/services/categoryService'
import { exportToExcel, exportToPdf } from '@/features/admin/services/reportService'
import { emptyCategoryForm } from '@/features/admin/constants'
import { useToast } from '@/shared/toast'

const statusOptions = [
  { value: 'Activa', label: 'Activa' },
  { value: 'Pausada', label: 'Pausada' },
]

export default function CategoriesTab({
  categories = [],
  setCategories,
  products = [],
  searchValue = '',
  onSearchChange,
}) {
  const { showToast } = useToast()
  const confirm = useConfirm()
  const [localSearch, setLocalSearch] = useState('')
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm)
  const [formError, setFormError] = useState('')

  const currentSearch = onSearchChange ? searchValue : localSearch
  const handleSearch = onSearchChange || setLocalSearch

  const categoryRows = useMemo(() => categories.map((item) => {
    const catName = String(item.name || '').toLowerCase().trim()
    const catSlug = String(item.slug || '').toLowerCase().trim()
    const catId = String(item.id || item._id || '').toLowerCase().trim()
    const liveCount = products.filter((p) => {
      const pCat = String(p?.category || '').toLowerCase().trim()
      return pCat === catName || pCat === catSlug || pCat === catId
    }).length
    return {
      id: item.id || item._id,
      rawId: item.id || item._id,
      name: item.name,
      slug: item.slug,
      products: liveCount,
      revenue: item.revenue || '$0',
      status: item.status,
      statusTone: item.statusTone || (item.status === 'Pausada' ? 'warning' : 'success'),
    }
  }), [categories, products])

  const openCategoryModal = (category = null) => {
    setFormError('')
    if (category) {
      setEditingCategoryId(category.id || category.rawId)
      setCategoryForm({
        name: category.name || '',
        description: category.description || '',
        status: category.status || 'Activa',
      })
    } else {
      setEditingCategoryId(null)
      setCategoryForm(emptyCategoryForm)
    }
    setCategoryModalOpen(true)
  }

  const handleDeleteCategory = async (id, categoryName) => {
    // Validar si existen productos asociados
    const normName = String(categoryName || '').toLowerCase().trim()
    const targetCat = categories.find((c) => (c.id ?? c._id) === id)
    const normSlug = String(targetCat?.slug || '').toLowerCase().trim()
    const normId = String(id || '').toLowerCase().trim()
    const linkedProducts = products.filter((p) => {
      const pCat = String(p?.category || '').toLowerCase().trim()
      return pCat === normName || pCat === normSlug || pCat === normId
    })

    if (linkedProducts.length > 0) {
      await confirm({
        type: 'danger',
        title: 'Acción bloqueada',
        message: `No se puede eliminar la categoría "${categoryName}" porque tiene ${linkedProducts.length} ${
          linkedProducts.length === 1 ? 'producto asociado' : 'productos asociados'
        } en el catálogo. Reasigna los productos primero.`,
        confirmText: 'Entendido',
        showCancel: false,
      })
      return
    }

    const ok = await confirm({
      type: 'danger',
      title: '¿Eliminar categoría?',
      message: `¿Estás seguro de que deseas eliminar la categoría "${categoryName}" del catálogo?`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
    })

    if (!ok) return

    try {
      const result = await deleteCategory(id)
      if (result?.ok === false) return
      setCategories?.((prev) => prev.filter((item) => (item.id ?? item._id) !== id))
      showToast('Categoría eliminada', 'Se retiró la categoría del catálogo.', '🗑️')
    } catch (err) {
      showToast('Error', err.message || 'No se pudo eliminar la categoría.', '❌')
    }
  }

  const handleCategorySubmit = async (event) => {
    event.preventDefault()

    if (!categoryForm.name.trim() || categoryForm.name.trim().length < 2) {
      setFormError('El nombre de la categoría debe tener al menos 2 caracteres.')
      showToast('Formulario incompleto', 'Por favor revisa los campos requeridos.', '⚠️')
      return
    }

    const payload = {
      name: categoryForm.name.trim(),
      description: categoryForm.description.trim(),
      status: categoryForm.status || 'Activa',
    }

    try {
      let savedCategory
      if (editingCategoryId) {
        savedCategory = await updateCategory(editingCategoryId, payload)
        setCategories?.((prev) =>
          prev.map((item) =>
            (item.id ?? item._id) === editingCategoryId
              ? { ...item, ...savedCategory, statusTone: savedCategory.status === 'Pausada' ? 'warning' : 'success' }
              : item,
          ),
        )
        showToast('Categoría actualizada', 'Se guardaron los cambios.', '✅')
      } else {
        savedCategory = await createCategory(payload)
        setCategories?.((prev) => [
          {
            ...savedCategory,
            products: savedCategory.products || 0,
            revenue: savedCategory.revenue || '$0',
            statusTone: savedCategory.status === 'Pausada' ? 'warning' : 'success',
          },
          ...prev,
        ])
        showToast('Categoría creada', 'Se añadió la categoría al catálogo.', '✅')
      }

      setCategoryModalOpen(false)
      resetCategoryForm(emptyCategoryForm)
      setEditingCategoryId(null)
    } catch (err) {
      showToast('Error', err.message || 'No se pudo guardar la categoría.', '❌')
    }
  }

  const categoryColumns = [
    {
      key: 'name',
      header: 'Categoría',
      render: (row) => (
        <div>
          <p className="font-semibold text-glowe-dark">{row.name}</p>
        </div>
      ),
    },
    {
      key: 'products',
      header: 'Productos',
      render: (row) => <span className="text-sm font-semibold text-glowe-dark">{row.products}</span>,
    },
    {
      key: 'revenue',
      header: 'Ventas',
      render: (row) => <span className="font-bold text-glowe-dark">{row.revenue}</span>,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (row) => <StatusBadge label={row.status} tone={row.statusTone} />,
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <ActionButton type="edit" title="Editar categoría" onClick={() => openCategoryModal(row)} />
          <ActionButton type="delete" title="Eliminar categoría" onClick={() => handleDeleteCategory(row.rawId || row.id, row.name)} />
        </div>
      ),
    },
  ]

  const handleExport = (type) => {
    const payload = categoryRows.map((row) => ({
      Nombre: row.name,
      Productos: row.products,
      Ventas: row.revenue,
      Estado: row.status,
    }))

    if (type === 'excel') {
      exportToExcel({ title: 'reporte-categorias', payload })
    } else {
      exportToPdf({ title: 'reporte-categorias', moduleTitle: 'Categoría de productos', payload })
    }
  }

  return (
    <>
      <DataTable
        title="Categoría de productos"
        rows={categoryRows}
        columns={categoryColumns}
        searchValue={currentSearch}
        onSearchChange={handleSearch}
        primaryActionLabel="+ Nueva categoría"
        onPrimaryAction={() => openCategoryModal()}
        onExportPdf={() => handleExport('pdf')}
        onExportExcel={() => handleExport('excel')}
      />

      <AdminModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title={editingCategoryId ? 'Editar categoría' : 'Crear categoría'}
      >
        <form onSubmit={handleCategorySubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
                Nombre
              </label>
              <Input
                name="name"
                value={categoryForm.name}
                onChange={(e) => {
                  setCategoryForm((prev) => ({ ...prev, name: e.target.value }))
                  if (formError) setFormError('')
                }}
                error={Boolean(formError)}
                errorMessage={formError}
                placeholder="Ej. Maquillaje"
                className="w-full"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
                Descripción (Opcional)
              </label>
              <textarea
                value={categoryForm.description}
                onChange={(event) =>
                  setCategoryForm((prev) => ({ ...prev, description: event.target.value }))
                }
                rows="3"
                className="glass-input min-h-[100px] rounded-[1.5rem] px-4 py-3 text-sm text-glowe-dark placeholder:text-glowe-muted"
                placeholder="Describe la categoría (opcional)"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
                Estado
              </label>
              <Select
                value={categoryForm.status}
                onChange={(event) =>
                  setCategoryForm((prev) => ({ ...prev, status: event.target.value }))
                }
                options={statusOptions}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="glass" fullWidth type="button" onClick={() => setCategoryModalOpen(false)} className="sm:w-auto">
              Cancelar
            </Button>
            <Button variant="gradient" fullWidth type="submit" className="sm:w-auto">
              {editingCategoryId ? 'Guardar cambios' : 'Crear categoría'}
            </Button>
          </div>
        </form>
      </AdminModal>
    </>
  )
}
