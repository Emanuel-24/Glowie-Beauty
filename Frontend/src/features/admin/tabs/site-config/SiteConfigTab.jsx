import { useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import Button from '@/shared/components/ui/Button'
import Input from '@/shared/components/ui/Input'
import Select from '@/shared/components/ui/Select'
import { formatCOP } from '@/features/admin/constants'
import { updateSiteConfig } from '@/features/home/services/siteConfigService'
import { useToast } from '@/shared/toast'
import CommunityPostModal from './CommunityPostModal'

export default function SiteConfigTab({
  siteConfigData,
  setSiteConfigData,
  products = [],
}) {
  const { showToast } = useToast()
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [communityModalOpen, setCommunityModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState(null)

  const handleSaveSiteConfig = async (e) => {
    if (e?.preventDefault) e.preventDefault()
    setIsSavingConfig(true)
    try {
      const updated = await updateSiteConfig(siteConfigData)
      setSiteConfigData(updated)
      showToast('Configuración guardada', 'Los cambios en Hero y Comunidad Glowe se han actualizado.', '✅')
    } catch (err) {
      showToast('Error', err.message || 'No se pudo guardar la configuración.', '❌')
    } finally {
      setIsSavingConfig(false)
    }
  }

  const handleSaveCommunityPost = (savedPost) => {
    setSiteConfigData((prev) => {
      const current = [...(prev.communityConfig || [])]
      if (savedPost.index !== undefined && savedPost.index >= 0) {
        current[savedPost.index] = {
          id: savedPost.id,
          imageUrl: savedPost.imageUrl,
          title: savedPost.title,
          link: savedPost.link,
        }
      } else {
        current.push({
          id: savedPost.id,
          imageUrl: savedPost.imageUrl,
          title: savedPost.title,
          link: savedPost.link,
        })
      }
      return { ...prev, communityConfig: current }
    })
    showToast('Actualizado', 'Publicación actualizada en la lista. Guarda la configuración para persistir.', '✨')
  }

  const handleRemoveCommunityItem = (index) => {
    setSiteConfigData((prev) => ({
      ...prev,
      communityConfig: (prev.communityConfig || []).filter((_, i) => i !== index),
    }))
    showToast('Eliminado', 'Elemento removido. Guarda los cambios para persistir.', '🗑️')
  }

  const openNewPostModal = () => {
    setEditingPost(null)
    setCommunityModalOpen(true)
  }

  const openEditPostModal = (item, index) => {
    setEditingPost({ ...item, index })
    setCommunityModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-glowe-muted">Personaliza la sección Hero principal y el escaparate de la Comunidad Glowe.</p>
        <Button
          variant="gradient"
          onClick={handleSaveSiteConfig}
          disabled={isSavingConfig}
          className="sm:w-auto"
        >
          {isSavingConfig ? 'Guardando...' : '💾 Guardar Configuración'}
        </Button>
      </div>

      {/* Hero Section Configuration */}
      <section className="rounded-[1.8rem] border border-white/80 bg-white/70 p-5 shadow-sm space-y-4 backdrop-blur-md">
        <div className="flex items-center gap-2 border-b border-pink-100 pb-3">
          <span className="text-xl">✨</span>
          <h2 className="font-serif text-xl font-bold text-glowe-dark">Hero Section (Cabecera Principal)</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
              Producto Destacado (Featured Product)
            </label>
            <Select
              value={siteConfigData.heroConfig?.featuredProductId || ''}
              onChange={(e) =>
                setSiteConfigData((prev) => ({
                  ...prev,
                  heroConfig: {
                    ...prev.heroConfig,
                    featuredProductId: e.target.value || null,
                  },
                }))
              }
              placeholder="-- Sin producto seleccionado (Automático) --"
              options={[
                { value: '', label: '-- Sin producto seleccionado (Automático) --' },
                ...products.map((p) => ({
                  value: p.id,
                  label: `${p.name} (${p.brand}) - ${formatCOP(p.price)}`,
                })),
              ]}
            />
            <p className="mt-1 text-[11px] text-glowe-muted">
              Selecciona el producto que se vinculará como oferta/estrella en la sección Hero.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
              Texto del Badge Flotante
            </label>
            <Input
              value={siteConfigData.heroConfig?.floatingBadgeText || ''}
              onChange={(e) =>
                setSiteConfigData((prev) => ({
                  ...prev,
                  heroConfig: {
                    ...prev.heroConfig,
                    floatingBadgeText: e.target.value,
                  },
                }))
              }
              placeholder="✨ ¡Nuevo producto!"
              className="w-full"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
              Tagline / Subtítulo Superior
            </label>
            <Input
              value={siteConfigData.heroConfig?.tagline || ''}
              onChange={(e) =>
                setSiteConfigData((prev) => ({
                  ...prev,
                  heroConfig: {
                    ...prev.heroConfig,
                    tagline: e.target.value,
                  },
                }))
              }
              placeholder="RUTINA COMPLETA"
              className="w-full"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
              Título Principal del Showcase
            </label>
            <Input
              value={siteConfigData.heroConfig?.title || ''}
              onChange={(e) =>
                setSiteConfigData((prev) => ({
                  ...prev,
                  heroConfig: {
                    ...prev.heroConfig,
                    title: e.target.value,
                  },
                }))
              }
              placeholder="Glow Natural Everyday"
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* Comunidad Glowe Section Configuration */}
      <section className="rounded-[1.8rem] border border-white/80 bg-white/70 p-5 shadow-sm space-y-4 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-pink-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📸</span>
            <h2 className="font-serif text-xl font-bold text-glowe-dark">Comunidad Glowe (Instagram Feed & Testimonios)</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-glowe-muted">
              {(siteConfigData.communityConfig || []).length} elementos
            </span>
            <Button size="sm" variant="glass" onClick={openNewPostModal} className="gap-1.5 text-xs font-bold">
              <Plus className="w-3.5 h-3.5" />
              Nueva publicación
            </Button>
          </div>
        </div>

        {/* Listado actual con editar y eliminar */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(siteConfigData.communityConfig || []).map((item, idx) => (
            <div key={item.id || idx} className="relative group overflow-hidden rounded-2xl border border-white/80 bg-white/80 p-2.5 shadow-sm transition hover:shadow-md">
              <div className="aspect-square w-full overflow-hidden rounded-xl bg-slate-100 mb-2">
                <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
              </div>
              <div className="space-y-1">
                <p className="truncate text-xs font-bold text-glowe-dark">{item.title || '@glowe_beauty'}</p>
                <p className="truncate text-[10px] text-glowe-muted">{item.link || 'Sin enlace'}</p>
              </div>

              {/* Botones de acción */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
                <button
                  type="button"
                  onClick={() => openEditPostModal(item, idx)}
                  className="rounded-full bg-white/90 p-1.5 text-xs text-glowe-dark hover:bg-white shadow-xs transition"
                  title="Editar publicación"
                  aria-label="Editar publicación"
                >
                  <Pencil className="w-3.5 h-3.5 text-glowe-blue-accent" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveCommunityItem(idx)}
                  className="rounded-full bg-rose-500/90 p-1.5 text-xs text-white hover:bg-rose-600 shadow-xs transition"
                  title="Eliminar publicación"
                  aria-label="Eliminar publicación"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal de Crear / Editar Publicación de Comunidad */}
      <CommunityPostModal
        isOpen={communityModalOpen}
        onClose={() => setCommunityModalOpen(false)}
        post={editingPost}
        onSave={handleSaveCommunityPost}
      />
    </div>
  )
}
