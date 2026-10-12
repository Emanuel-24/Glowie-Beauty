import { useState, useRef } from 'react'
import { UploadCloud, Image as ImageIcon, Link as LinkIcon, X, CheckCircle, Loader2 } from 'lucide-react'
import { optimizeImage, formatFileSize } from '@/shared/utils/imageOptimizer'
import Input from '@/shared/components/ui/Input'
import Button from '@/shared/components/ui/Button'

/**
 * ImageUploader — Componente de carga drag-and-drop con compresión WebP cliente
 * y soporte dual para URL externa.
 */
export default function ImageUploader({
  value = '',
  onChange,
  label = 'Imagen del producto',
  error = '',
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [mode, setMode] = useState('upload') // 'upload' | 'url'
  const [stats, setStats] = useState(null)
  const [processError, setProcessError] = useState('')
  const fileInputRef = useRef(null)

  const handleProcessFile = async (file) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setProcessError('El archivo debe ser una imagen válida (PNG, JPG, WEBP, etc.).')
      return
    }

    setProcessError('')
    setIsProcessing(true)

    try {
      const result = await optimizeImage(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.82,
      })

      setStats({
        format: result.format,
        size: formatFileSize(result.optimizedSize),
        originalSize: formatFileSize(result.originalSize),
      })

      onChange?.(result.dataUrl)
    } catch (err) {
      setProcessError(err.message || 'Error al procesar la imagen.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleProcessFile(file)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleProcessFile(file)
    }
    // Limpiar input para permitir seleccionar el mismo archivo si se desea
    e.target.value = ''
  }

  const handleRemove = () => {
    onChange?.('')
    setStats(null)
    setProcessError('')
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
          {label}
        </label>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-colors ${
              mode === 'upload'
                ? 'bg-pink-100 text-glowe-pink-accent'
                : 'text-glowe-muted hover:text-glowe-dark'
            }`}
          >
            Subir archivo
          </button>
          <span className="text-[10px] text-slate-300">•</span>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-colors ${
              mode === 'url'
                ? 'bg-pink-100 text-glowe-pink-accent'
                : 'text-glowe-muted hover:text-glowe-dark'
            }`}
          >
            Enlace URL
          </button>
        </div>
      </div>

      {mode === 'url' ? (
        <div className="space-y-2">
          <Input
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder="https://ejemplo.com/imagen.jpg"
            className="w-full text-xs"
          />
          {value && (
            <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/70 p-2.5">
              <img
                src={value}
                alt="Vista previa"
                className="h-12 w-12 rounded-xl object-cover ring-1 ring-glowe-pink/30"
                onError={() => setProcessError('No se pudo cargar la vista previa desde esta URL.')}
                onLoad={() => setProcessError('')}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-glowe-dark">URL remota enlazada</p>
                <p className="truncate text-[10px] text-glowe-muted">{value}</p>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="rounded-full p-1.5 text-glowe-muted transition hover:bg-rose-50 hover:text-rose-600"
                title="Quitar imagen"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          {value ? (
            /* Tarjeta de preview con imagen cargada */
            <div className="relative flex items-center gap-3 rounded-2xl border border-white/80 bg-white/80 p-3 shadow-sm backdrop-blur-md">
              <div className="relative shrink-0">
                <img
                  src={value}
                  alt="Vista previa"
                  className="h-16 w-16 rounded-xl object-cover ring-1 ring-glowe-pink/30"
                />
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                  <CheckCircle className="h-3 w-3" />
                </span>
              </div>

              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    {stats?.format || (value.startsWith('data:image/webp') ? 'WebP' : 'Optimizado')}
                  </span>
                  {stats?.size && (
                    <span className="text-[10px] font-semibold text-glowe-muted">
                      {stats.size} {stats.originalSize ? `(antes: ${stats.originalSize})` : ''}
                    </span>
                  )}
                </div>
                <p className="truncate text-xs font-semibold text-glowe-dark">
                  Imagen lista para el catálogo
                </p>
                <p className="text-[10px] text-glowe-muted">
                  Redimensionada y optimizada para máxima velocidad web
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-glowe-dark transition hover:bg-pink-50"
                >
                  Cambiar
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="rounded-full p-1.5 text-glowe-muted transition hover:bg-rose-50 hover:text-rose-600"
                  title="Eliminar imagen"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Zona Drag and Drop */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed p-6 text-center transition-all duration-200 ${
                isDragging
                  ? 'border-glowe-pink-accent bg-pink-50/60 ring-2 ring-glowe-pink/20 scale-[0.99]'
                  : 'border-glowe-pink/40 bg-white/60 hover:border-glowe-pink-accent hover:bg-white/80'
              }`}
            >
              {isProcessing ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <Loader2 className="h-7 w-7 animate-spin text-glowe-pink-accent" />
                  <p className="text-xs font-semibold text-glowe-dark">
                    Procesando y convirtiendo a WebP...
                  </p>
                  <p className="text-[10px] text-glowe-muted">Optimizando dimensiones y compresión</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-100/80 text-glowe-pink-accent shadow-inner">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <p className="mt-1 text-xs font-bold text-glowe-dark">
                    Arrastra una imagen aquí o{' '}
                    <span className="text-glowe-pink-accent underline">haz clic para explorar</span>
                  </p>
                  <p className="text-[10px] text-glowe-muted">
                    Conversión automática a WebP ligero (≤ 150 KB) • PNG, JPG, WebP
                  </p>
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {(processError || error) && (
        <p className="mt-1 text-[11px] font-medium text-rose-500" role="alert">
          {processError || error}
        </p>
      )}
    </div>
  )
}
