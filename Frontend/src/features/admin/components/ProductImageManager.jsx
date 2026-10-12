import { useState } from 'react'
import { Star, Trash2, Plus, Image as ImageIcon } from 'lucide-react'
import ImageUploader from './ImageUploader'

const MAX_IMAGES = 3

const SLOT_LABELS = [
  { index: 0, title: 'Imagen 1 (Principal)', desc: 'Portada en catálogo y tarjetas', isPrimary: true },
  { index: 1, title: 'Imagen 2 (Secundaria)', desc: 'Vista alternativa o swatch', isPrimary: false },
  { index: 2, title: 'Imagen 3 (Detalle)', desc: 'Textura, empaque o modo de uso', isPrimary: false },
]

/**
 * ProductImageManager — Gestor de hasta 3 imágenes para productos
 * con soporte para slot principal, compresión WebP y slots secundarios.
 */
export default function ProductImageManager({
  images = [],
  primaryImage = '',
  onChange,
}) {
  const [activeSlot, setActiveSlot] = useState(0)

  // Normalizar array a máximo 3 posiciones
  const currentImages = Array.isArray(images) ? images.slice(0, MAX_IMAGES) : []
  
  // Asegurar que si primaryImage existe pero images está vacío, se refleje en slot 0
  const normalizedSlots = [
    currentImages[0] || primaryImage || '',
    currentImages[1] || '',
    currentImages[2] || '',
  ]

  const handleUpdateSlot = (slotIndex, newUrl) => {
    const updated = [...normalizedSlots]
    updated[slotIndex] = newUrl || ''
    
    // Filtrar elementos vacíos preservando el orden relativo
    const cleaned = updated.filter(Boolean).slice(0, MAX_IMAGES)
    
    onChange?.({
      images: cleaned,
      primaryImage: cleaned[0] || '',
    })
  }

  const handleRemoveSlot = (e, slotIndex) => {
    e.stopPropagation()
    const updated = [...normalizedSlots]
    updated[slotIndex] = ''
    
    const cleaned = updated.filter(Boolean).slice(0, MAX_IMAGES)
    onChange?.({
      images: cleaned,
      primaryImage: cleaned[0] || '',
    })

    if (activeSlot === slotIndex) {
      // Dejar en el primer slot disponible
      setActiveSlot(0)
    }
  }

  const handleSetPrimary = (e, slotIndex) => {
    e.stopPropagation()
    if (slotIndex === 0) return
    const targetImg = normalizedSlots[slotIndex]
    if (!targetImg) return

    // Mover slotIndex a la primera posición
    const otherImgs = normalizedSlots.filter((_, idx) => idx !== slotIndex && Boolean(_))
    const reordered = [targetImg, ...otherImgs].slice(0, MAX_IMAGES)

    onChange?.({
      images: reordered,
      primaryImage: targetImg,
    })
    setActiveSlot(0)
  }

  const loadedCount = normalizedSlots.filter(Boolean).length

  return (
    <div className="space-y-3 rounded-2xl border border-white/80 bg-white/60 p-4 shadow-sm backdrop-blur-md">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
          Galería de imágenes del producto ({loadedCount}/{MAX_IMAGES})
        </label>
        <span className="text-[11px] font-semibold text-glowe-pink-accent">
          Máximo 3 fotos (WebP optimizado)
        </span>
      </div>

      {/* Grid de 3 miniaturas de slots */}
      <div className="grid grid-cols-3 gap-2.5">
        {SLOT_LABELS.map((slot) => {
          const imgUrl = normalizedSlots[slot.index]
          const isSelected = activeSlot === slot.index

          return (
            <div
              key={slot.index}
              onClick={() => setActiveSlot(slot.index)}
              className={`group relative flex flex-col items-center justify-center rounded-2xl border p-2 text-center transition-all cursor-pointer ${
                isSelected
                  ? 'border-glowe-pink-accent bg-pink-50/70 shadow-sm ring-2 ring-glowe-pink/20'
                  : 'border-white/80 bg-white/70 hover:border-pink-300 hover:bg-white/90'
              }`}
            >
              {imgUrl ? (
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100">
                  <img
                    src={imgUrl}
                    alt={slot.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  {slot.index === 0 && (
                    <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded-full bg-pink-600/90 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs backdrop-blur-xs">
                      <Star className="h-2.5 w-2.5 fill-current" />
                      Portada
                    </span>
                  )}
                  <div className="absolute right-1 top-1 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {slot.index !== 0 && (
                      <button
                        type="button"
                        onClick={(e) => handleSetPrimary(e, slot.index)}
                        title="Hacer portada principal"
                        className="rounded-full bg-white/90 p-1 text-amber-600 shadow hover:bg-white"
                      >
                        <Star className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleRemoveSlot(e, slot.index)}
                      title="Eliminar esta foto"
                      className="rounded-full bg-white/90 p-1 text-rose-600 shadow hover:bg-white"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex aspect-square w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/40">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100/60 text-glowe-pink-accent">
                    <Plus className="h-4 w-4" />
                  </div>
                  <span className="mt-1 text-[10px] font-bold text-glowe-muted">
                    Slot {slot.index + 1}
                  </span>
                </div>
              )}

              <div className="mt-1.5 flex items-center gap-1">
                <span className="truncate text-[10px] font-semibold text-glowe-dark">
                  {slot.index === 0 ? '⭐ Principal' : `Foto #${slot.index + 1}`}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Cargador activo enfocado en el slot seleccionado */}
      <div className="pt-1">
        <ImageUploader
          key={`slot-${activeSlot}`}
          value={normalizedSlots[activeSlot]}
          onChange={(newUrl) => handleUpdateSlot(activeSlot, newUrl)}
          label={SLOT_LABELS[activeSlot].title}
        />
        <p className="mt-1 text-[10px] text-glowe-muted italic">
          {SLOT_LABELS[activeSlot].desc}
        </p>
      </div>
    </div>
  )
}
