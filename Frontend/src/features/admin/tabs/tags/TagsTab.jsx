import { useState, useMemo } from 'react'
import DataTable from '@/features/admin/components/DataTable'
import AdminModal from '@/features/admin/components/AdminModal'
import ActionButton from '@/features/admin/components/ActionButton'
import Button from '@/shared/components/ui/Button'
import Input from '@/shared/components/ui/Input'
import { createTag, deleteTag } from '@/features/products/services/tagService'
import { exportToExcel, exportToPdf } from '@/features/admin/services/reportService'
import { emptyTagForm } from '@/features/admin/constants'
import { useToast } from '@/shared/toast'

export default function TagsTab({
  tags = [],
  setTags,
  searchValue = '',
  onSearchChange,
}) {
  const { showToast } = useToast()
  const [localSearch, setLocalSearch] = useState('')
  const [tagModalOpen, setTagModalOpen] = useState(false)
  const [tagForm, setTagForm] = useState(emptyTagForm)

  const currentSearch = onSearchChange ? searchValue : localSearch
  const handleSearch = onSearchChange || setLocalSearch

  const tagRows = useMemo(
    () =>
      tags.map((tag) => ({
        id: tag.id || tag._id,
        name: tag.name,
        slug: tag.slug || '',
        description: tag.description || 'Sin descripción',
        products: Number(tag.products || 0),
      })),
    [tags],
  )

  const handleDeleteTag = async (id) => {
    if (typeof window !== 'undefined' && window.confirm) {
      if (!window.confirm('¿Eliminar esta etiqueta?')) return
    }

    const result = await deleteTag(id)
    if (result?.ok === false) return
    setTags?.((prev) => prev.filter((item) => (item.id ?? item._id) !== id))
    showToast('Etiqueta eliminada', 'Se retiró la etiqueta.', '🗑️')
  }

  const handleTagSubmit = async (event) => {
    event.preventDefault()
    if (!tagForm.name.trim()) {
      showToast('Error', 'El nombre de la etiqueta es obligatorio.', '⚠️')
      return
    }

    try {
      const created = await createTag({
        name: tagForm.name.trim(),
        description: tagForm.description.trim(),
      })
      setTags?.((prev) => [...prev, created])
      setTagModalOpen(false)
      setTagForm(emptyTagForm)
      showToast('Etiqueta creada', `Se añadió #${created.name}.`, '✅')
    } catch (err) {
      showToast('Error', err.message || 'No se pudo crear la etiqueta.', '❌')
    }
  }

  const tagColumns = [
    {
      key: 'name',
      header: 'Etiqueta',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-bold text-glowe-pink-accent">
            #{row.name}
          </span>
          <span className="text-xs text-glowe-muted">({row.slug})</span>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Descripción',
      render: (row) => <span className="text-sm text-glowe-muted">{row.description}</span>,
    },
    {
      key: 'products',
      header: 'Productos asociados',
      render: (row) => <span className="text-sm font-semibold text-glowe-dark">{row.products}</span>,
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (row) => (
        <div className="flex items-center gap-2">
          <ActionButton type="delete" title="Eliminar etiqueta" onClick={() => handleDeleteTag(row.id)}>
            Eliminar
          </ActionButton>
        </div>
      ),
    },
  ]

  const handleExport = (type) => {
    const payload = tagRows.map((row) => ({
      Nombre: row.name,
      Slug: row.slug,
      Descripcion: row.description,
      ProductosAsociados: row.products,
    }))

    if (type === 'excel') {
      exportToExcel({ title: 'reporte-etiquetas', payload })
    } else {
      exportToPdf({ title: 'reporte-etiquetas', moduleTitle: 'Etiquetas / Tags', payload })
    }
  }

  return (
    <>
      <DataTable
        title="Etiquetas / Tags"
        rows={tagRows}
        columns={tagColumns}
        searchValue={currentSearch}
        onSearchChange={handleSearch}
        primaryActionLabel="+ Nueva etiqueta"
        onPrimaryAction={() => {
          setTagForm(emptyTagForm)
          setTagModalOpen(true)
        }}
        onExportPdf={() => handleExport('pdf')}
        onExportExcel={() => handleExport('excel')}
      />

      <AdminModal
        isOpen={tagModalOpen}
        onClose={() => setTagModalOpen(false)}
        title="Crear Etiqueta / Tag"
      >
        <form onSubmit={handleTagSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
                Nombre de la Etiqueta (ej: Ojos, Rostro, Labios, Look Natural)
              </label>
              <Input
                value={tagForm.name}
                onChange={(event) => setTagForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Ej. Rostro"
                className="w-full"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
                Descripción (Opcional)
              </label>
              <textarea
                value={tagForm.description}
                onChange={(event) => setTagForm((prev) => ({ ...prev, description: event.target.value }))}
                rows="3"
                className="glass-input min-h-[90px] rounded-[1.5rem] px-4 py-3 text-sm text-glowe-dark placeholder:text-glowe-muted"
                placeholder="Descripción o propósito de esta etiqueta"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="glass" fullWidth type="button" onClick={() => setTagModalOpen(false)} className="sm:w-auto">
              Cancelar
            </Button>
            <Button variant="gradient" fullWidth type="submit" className="sm:w-auto">
              Crear etiqueta
            </Button>
          </div>
        </form>
      </AdminModal>
    </>
  )
}
