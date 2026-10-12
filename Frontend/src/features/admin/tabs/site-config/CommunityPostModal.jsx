import { useState, useEffect, useRef } from 'react'
import { Upload, Image as ImageIcon, Sparkles, Check } from 'lucide-react'
import AdminModal from '@/features/admin/components/AdminModal'
import { Button, Input, ButtonLoading } from '@/shared/components/ui'
import { optimizeImage } from '@/shared/utils/imageOptimizer'
import { useToast } from '@/shared/toast'
import { useUnsavedChangesWarning } from '@/shared/hooks/useUnsavedChangesWarning'

export default function CommunityPostModal({
  isOpen,
  onClose,
  post = null,
  onSave,
}) {
  const { showToast } = useToast()
  const fileInputRef = useRef(null)
  const [imageUrl, setImageUrl] = useState('')
  const [title, setTitle] = useState('')
  const [link, setLink] = useState('')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizedInfo, setOptimizedInfo] = useState(null)

  const isEditing = Boolean(post?.id || post?.index !== undefined)
  const hasChanges = Boolean(imageUrl || title || link)
  useUnsavedChangesWarning(hasChanges && isOpen)

  useEffect(() => {
    if (isOpen) {
      if (post) {
        setImageUrl(post.imageUrl || '')
        setTitle(post.title || '')
        setLink(post.link || '')
      } else {
        setImageUrl('')
        setTitle('')
        setLink('')
      }
      setOptimizedInfo(null)
      setIsOptimizing(false)
    }
  }, [isOpen, post])

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('Formato no soportado', 'Por favor selecciona un archivo de imagen.', '⚠️')
      return
    }

    setIsOptimizing(true)
    try {
      const result = await optimizeImage(file, { maxWidth: 900, maxHeight: 900, quality: 0.85 })
      setImageUrl(result.dataUrl)
      setOptimizedInfo({
        format: result.format,
        size: Math.round(result.optimizedSize / 1024),
      })
      showToast('Imagen optimizada', `Convertida a ${result.format} (~${Math.round(result.optimizedSize / 1024)} KB).`, '✨')
    } catch (err) {
      showToast('Error al optimizar', err.message || 'No se pudo procesar la imagen.', '❌')
    } finally {
      setIsOptimizing(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!imageUrl.trim()) {
      showToast('Imagen requerida', 'Debes ingresar una URL o cargar una imagen.', '⚠️')
      return
    }

    onSave({
      id: post?.id || `comm-${Date.now()}`,
      imageUrl: imageUrl.trim(),
      title: title.trim() || '@glowe_community',
      link: link.trim() || 'https://instagram.com/glowebeautytienda',
      index: post?.index,
    })

    onClose()
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Publicación de Comunidad' : 'Nueva Publicación de Comunidad'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Previsualización */}
        {imageUrl && (
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/80 bg-slate-100 shadow-inner">
            <img src={imageUrl} alt="Vista previa" className="h-full w-full object-cover" />
            {optimizedInfo && (
              <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" /> WebP {optimizedInfo.size} KB
              </span>
            )}
          </div>
        )}

        {/* Carga por Archivo Local */}
        <div className="rounded-2xl border border-dashed border-pink-300 bg-pink-50/50 p-3 text-center space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="community-file-upload"
          />
          <label
            htmlFor="community-file-upload"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-pink-200 text-glowe-dark text-xs font-semibold shadow-xs hover:bg-pink-100/60 cursor-pointer transition"
          >
            <Upload className="w-4 h-4 text-glowe-pink-accent" />
            <span>{isOptimizing ? 'Optimizando a WebP...' : 'Subir archivo de imagen local'}</span>
          </label>
          <p className="text-[10px] text-glowe-muted">
            Optimización automática a formato WebP ligero (&le; 150 KB)
          </p>
        </div>

        {/* O URL directa */}
        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
            O ingresa URL de imagen directa
          </label>
          <Input
            value={imageUrl.startsWith('data:') ? '' : imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value)
              setOptimizedInfo(null)
            }}
            placeholder="https://ejemplo.com/foto.jpg"
            className="w-full text-xs"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
            Título o usuario de Instagram
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. @mariana_makeup"
            className="w-full text-xs"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
            Enlace de destino (opcional)
          </label>
          <Input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://instagram.com/p/..."
            className="w-full text-xs"
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button variant="glass" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <ButtonLoading
            type="submit"
            variant="gradient"
            loading={isOptimizing}
            disabled={!imageUrl.trim()}
          >
            {isEditing ? 'Guardar cambios' : 'Añadir publicación'}
          </ButtonLoading>
        </div>
      </form>
    </AdminModal>
  )
}
