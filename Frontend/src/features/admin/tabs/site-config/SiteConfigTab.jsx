import { useState } from 'react'
import Button from '@/shared/components/ui/Button'
import Input from '@/shared/components/ui/Input'
import { formatCOP } from '@/features/admin/constants'
import { updateSiteConfig } from '@/features/home/services/siteConfigService'
import { useToast } from '@/shared/toast'

export default function SiteConfigTab({
  siteConfigData,
  setSiteConfigData,
  products = [],
}) {
  const { showToast } = useToast()
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [newCommunityItem, setNewCommunityItem] = useState({ imageUrl: '', title: '', link: '' })

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

  const handleAddCommunityItem = () => {
    if (!newCommunityItem.imageUrl.trim()) {
      showToast('Imagen requerida', 'Debes ingresar una URL de imagen.', '⚠️')
      return
    }

    const item = {
      id: `comm-${Date.now()}`,
      imageUrl: newCommunityItem.imageUrl.trim(),
      title: newCommunityItem.title.trim() || '@glowe_community',
      link: newCommunityItem.link.trim() || 'https://instagram.com/GloweBeautyCO',
    }

    setSiteConfigData((prev) => ({
      ...prev,
      communityConfig: [...(prev.communityConfig || []), item],
    }))

    setNewCommunityItem({ imageUrl: '', title: '', link: '' })
    showToast('Añadido', 'Elemento agregado a la lista. Guarda los cambios para persistir.', '✨')
  }

  const handleRemoveCommunityItem = (index) => {
    setSiteConfigData((prev) => ({
      ...prev,
      communityConfig: (prev.communityConfig || []).filter((_, i) => i !== index),
    }))
    showToast('Eliminado', 'Elemento removido. Guarda los cambios para persistir.', '🗑️')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-glowe-pink-accent">CMS Storefront</p>
          <h1 className="font-serif text-2xl font-bold text-glowe-dark sm:text-3xl">Configuración de Tienda</h1>
          <p className="text-xs text-glowe-muted">Personaliza la sección Hero principal y el escaparate de la Comunidad Glowe.</p>
        </div>
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
            <select
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
              className="glass-input h-11 w-full rounded-full px-4 text-sm"
            >
              <option value="">-- Sin producto seleccionado (Automático) --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.brand}) - {formatCOP(p.price)}
                </option>
              ))}
            </select>
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
          <span className="text-xs font-semibold text-glowe-muted">
            {(siteConfigData.communityConfig || []).length} elementos
          </span>
        </div>

        {/* Listado actual */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(siteConfigData.communityConfig || []).map((item, idx) => (
            <div key={item.id || idx} className="relative group overflow-hidden rounded-2xl border border-white/80 bg-white/80 p-2.5 shadow-sm">
              <div className="aspect-square w-full overflow-hidden rounded-xl bg-slate-100 mb-2">
                <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
              </div>
              <div className="space-y-1">
                <p className="truncate text-xs font-bold text-glowe-dark">{item.title || '@glowe_beauty'}</p>
                <p className="truncate text-[10px] text-glowe-muted">{item.link || 'Sin enlace'}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveCommunityItem(idx)}
                className="absolute top-4 right-4 rounded-full bg-rose-500/80 p-1.5 text-xs text-white opacity-90 hover:opacity-100 hover:bg-rose-600 transition shadow"
                title="Eliminar publicación"
                aria-label="Eliminar publicación"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Añadir nuevo elemento */}
        <div className="rounded-2xl border border-dashed border-pink-300 bg-pink-50/40 p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-glowe-pink-accent">
            + Añadir publicación a la comunidad
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              value={newCommunityItem.imageUrl}
              onChange={(e) => setNewCommunityItem((prev) => ({ ...prev, imageUrl: e.target.value }))}
              placeholder="URL de la imagen (requerido)"
              className="w-full text-xs"
            />
            <Input
              value={newCommunityItem.title}
              onChange={(e) => setNewCommunityItem((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Título o usuario (ej: @sofia_glowe)"
              className="w-full text-xs"
            />
            <Input
              value={newCommunityItem.link}
              onChange={(e) => setNewCommunityItem((prev) => ({ ...prev, link: e.target.value }))}
              placeholder="Enlace (ej: Instagram post URL)"
              className="w-full text-xs"
            />
          </div>
          <div className="flex justify-end">
            <Button size="sm" variant="glass" onClick={handleAddCommunityItem}>
              + Añadir a la lista
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
