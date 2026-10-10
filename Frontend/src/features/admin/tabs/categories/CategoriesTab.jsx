import { useState, useMemo } from 'react'
import DataTable from '@/features/admin/components/DataTable'
import AdminModal from '@/features/admin/components/AdminModal'
import ActionButton from '@/features/admin/components/ActionButton'
import StatusBadge from '@/features/admin/components/StatusBadge'
import Button from '@/shared/components/ui/Button'
import Input from '@/shared/components/ui/Input'
import { createCategory, updateCategory, deleteCategory } from '@/features/products/services/categoryService'
import { exportToExcel, exportToPdf } from '@/features/admin/services/reportService'
import { emptyCategoryForm } from '@/features/admin/constants'
import { useToast } from '@/shared/toast'

export default function CategoriesTab({
  categories = [],
  setCategories,
  searchValue = '',
  onSearchChange,
}) {
  const { showToast } = useToast()
  const [localSearch, setLocalSearch] = useState('')
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm)

  const currentSearch = onSearchChange ? searchValue : localSearch
  const handleSearch = onSearchChange || setLocalSearch

  const categoryRows = useMemo(
    () =>
      categories.map((item) => ({
        id: item.id,
        name: item.name,
        products: item.products,
        revenue: item.revenue,
        status: item.status,
        statusTone: item.statusTone || (item.status === 'Pausada' ? 'warning' : 'success'),
      })),
    [categories],
  )

  const openCategoryModal = (category = null) => {
    if (category) {
      setEditingCategoryId(category.id)
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

  const handleDeleteCategory = async (id) => {
    if (typeof window !== 'undefined' && window.confirm) {
      if (!window.confirm('¿Eliminar esta categoría y quitarla del catálogo?')) return
    }

    const result = await deleteCategory(id)
    if (result?.ok === false) return
    setCategories?.((prev) => prev.filter((item) => (item.id ?? item._id) !== id))
    showToast('Categoría eliminada', 'Se retiró la categoría del catálogo.', '🗑️')
  }

  const handleCategorySubmit = async (event) => {
    event.preventDefault()

    const payload = {
      name: categoryForm.name.trim() || 'Nueva categoría',
      description: categoryForm.description.trim(),
      status: categoryForm.status || 'Activa',
    }

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
    setCategoryForm(emptyCategoryForm)
    setEditingCategoryId(null)
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
      render: (row) => (
        <div className="flex items-center gap-2">
          <ActionButton type="edit" title="Editar" onClick={() => openCategoryModal(row)}>
            Editar
          </ActionButton>
          <ActionButton type="delete" title="Eliminar" onClick={() => handleDeleteCategory(row.id)}>
            Eliminar
          </ActionButton>
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
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">Nombre</label>
              <Input
                value={categoryForm.name}
                onChange={(event) => setCategoryForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Ej. Maquillaje"
                className="w-full"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">Descripción</label>
              <textarea
                value={categoryForm.description}
                onChange={(event) => setCategoryForm((prev) => ({ ...prev, description: event.target.value }))}
                rows="3"
                className="glass-input min-h-[100px] rounded-[1.5rem] px-4 py-3 text-sm text-glowe-dark placeholder:text-glowe-muted"
                placeholder="Describe la categoría"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">Estado</label>
              <select
                value={categoryForm.status}
                onChange={(event) => setCategoryForm((prev) => ({ ...prev, status: event.target.value }))}
                className="glass-input h-11 rounded-full px-4"
              >
                <option value="Activa">Activa</option>
                <option value="Pausada">Pausada</option>
              </select>
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
