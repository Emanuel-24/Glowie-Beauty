import { useState, useMemo } from 'react'
import DataTable from '@/features/admin/components/DataTable'
import AdminModal from '@/features/admin/components/AdminModal'
import ActionButton from '@/features/admin/components/ActionButton'
import { Button, Input, useConfirm } from '@/shared/components/ui'
import { createTag, updateTag, deleteTag } from '@/features/products/services/tagService'
import { exportToExcel, exportToPdf } from '@/features/admin/services/reportService'
import { emptyTagForm } from '@/features/admin/constants'
import { useToast } from '@/shared/toast'

export default function TagsTab({
  tags = [],
  setTags,
  products = [],
  searchValue = '',
  onSearchChange,
}) {
  const { showToast } = useToast()
  const confirm = useConfirm()
  const [localSearch, setLocalSearch] = useState('')
  const [tagModalOpen, setTagModalOpen] = useState(false)
  const [editingTagId, setEditingTagId] = useState(null)
  const [tagForm, setTagForm] = useState(emptyTagForm)
  const [formError, setFormError] = useState('')

  const currentSearch = onSearchChange ? searchValue : localSearch
  const handleSearch = onSearchChange || setLocalSearch

  const tagRows = useMemo(
    () =>
      tags.map((tag) => {
        const tId = tag.id || tag._id
        const tName = String(tag.name || '').toLowerCase().trim()
        const count = products.filter((p) =>
          Array.isArray(p.tags) && p.tags.some((tg) => String(tg).toLowerCase().trim() === tName)
        ).length

        return {
          id: tId,
          rawId: tId,
          name: tag.name,
          slug: tag.slug || '',
          description: tag.description || 'Sin descripción',
          products: count,
          rawTag: tag,
        }
      }),
    [tags, products],
  )

  const openTagModal = (tag = null) => {
    setFormError('')
    if (tag) {
      setEditingTagId(tag.id || tag.rawId)
      setTagForm({
        name: tag.name || '',
        description: tag.description === 'Sin descripción' ? '' : tag.description || '',
      })
    } else {
      setEditingTagId(null)
      setTagForm(emptyTagForm)
    }
    setTagModalOpen(true)
  }

  const handleDeleteTag = async (id, tagName) => {
    const normName = String(tagName || '').toLowerCase().trim()
    const linkedProducts = products.filter(
      (p) => Array.isArray(p.tags) && p.tags.some((tg) => String(tg).toLowerCase().trim() === normName)
    )

    if (linkedProducts.length > 0) {
      await confirm({
        type: 'danger',
        title: 'Acción bloqueada',
        message: `No se puede eliminar la etiqueta #${tagName} porque está vinculada a ${linkedProducts.length} ${
          linkedProducts.length === 1 ? 'producto' : 'productos'
        } en el catálogo. Retírala de los productos primero.`,
        confirmText: 'Entendido',
        showCancel: false,
      })
      return
    }

    const ok = await confirm({
      type: 'danger',
      title: '¿Eliminar etiqueta?',
      message: `¿Estás seguro de que deseas eliminar la etiqueta #${tagName}?`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
    })

    if (!ok) return

    try {
      const result = await deleteTag(id)
      if (result?.ok === false) return
      setTags?.((prev) => prev.filter((item) => (item.id ?? item._id) !== id))
      showToast('Etiqueta eliminada', 'Se retiró la etiqueta.', '🗑️')
    } catch (err) {
      showToast('Error', err.message || 'No se pudo eliminar la etiqueta.', '❌')
    }
  }

  const handleTagSubmit = async (event) => {
    event.preventDefault()
    if (!tagForm.name.trim() || tagForm.name.trim().length < 2) {
      setFormError('El nombre de la etiqueta debe tener al menos 2 caracteres.')
      showToast('Error', 'Por favor verifica los campos de la etiqueta.', '⚠️')
      return
    }

    try {
      const payload = {
        name: tagForm.name.trim(),
        description: tagForm.description.trim(),
      }

      if (editingTagId) {
        const updated = await updateTag(editingTagId, payload)
        setTags?.((prev) =>
          prev.map((item) => ((item.id ?? item._id) === editingTagId ? { ...item, ...updated } : item)),
        )
        showToast('Etiqueta actualizada', `Se guardó #${updated.name}.`, '✅')
      } else {
        const created = await createTag(payload)
        setTags?.((prev) => [...prev, created])
        showToast('Etiqueta creada', `Se añadió #${created.name}.`, '✅')
      }

      setTagModalOpen(false)
      resetTagForm(emptyTagForm)
      setEditingTagId(null)
    } catch (err) {
      showToast('Error', err.message || 'No se pudo guardar la etiqueta.', '❌')
    }
  }

  const tagColumns = [
    {
      key: 'name',
      header: 'Etiqueta',
      render: (row) => (
        <div className="flex items-center">
          <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-bold text-glowe-pink-accent">
            #{row.name}
          </span>
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
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <ActionButton type="edit" title="Editar etiqueta" onClick={() => openTagModal(row.rawTag || row)} />
          <ActionButton type="delete" title="Eliminar etiqueta" onClick={() => handleDeleteTag(row.rawId || row.id, row.name)} />
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
        onPrimaryAction={() => openTagModal()}
        onExportPdf={() => handleExport('pdf')}
        onExportExcel={() => handleExport('excel')}
      />

      <AdminModal
        isOpen={tagModalOpen}
        onClose={() => setTagModalOpen(false)}
        title={editingTagId ? 'Editar Etiqueta / Tag' : 'Crear Etiqueta / Tag'}
      >
        <form onSubmit={handleTagSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
                Nombre de la Etiqueta (ej: Ojos, Rostro, Labios, Look Natural)
              </label>
              <Input
                name="name"
                value={tagForm.name}
                onChange={(e) => {
                  setTagForm((prev) => ({ ...prev, name: e.target.value }))
                  if (formError) setFormError('')
                }}
                error={Boolean(formError)}
                errorMessage={formError}
                placeholder="Ej. Rostro"
                className="w-full"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
                Descripción (Opcional)
              </label>
              <textarea
                value={tagForm.description}
                onChange={(event) =>
                  setTagForm((prev) => ({ ...prev, description: event.target.value }))
                }
                rows="3"
                className="glass-input min-h-[90px] rounded-[1.5rem] px-4 py-3 text-sm text-glowe-dark placeholder:text-glowe-muted"
                placeholder="Descripción o propósito de esta etiqueta (opcional)"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="glass" fullWidth type="button" onClick={() => setTagModalOpen(false)} className="sm:w-auto">
              Cancelar
            </Button>
            <Button variant="gradient" fullWidth type="submit" className="sm:w-auto">
              {editingTagId ? 'Guardar cambios' : 'Crear etiqueta'}
            </Button>
          </div>
        </form>
      </AdminModal>
    </>
  )
}
