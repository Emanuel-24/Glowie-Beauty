import { useMemo, useState, useRef, useEffect } from 'react'
import { Search, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import Input from '@/shared/components/ui/Input'
import { formatCOP } from '@/features/admin/constants'

const ITEMS_PER_PAGE = 8

export default function OfferProductSelector({
  selectedProduct,
  onSelectProduct,
  onClearProduct,
  products = [],
  lockProductSelection = false,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const containerRef = useRef(null)

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) {
      return products.slice(0, 32)
    }
    return products.filter((p) => {
      const name = (p.name || '').toLowerCase()
      const sku = String(p.id ?? p._id ?? '').toLowerCase()
      const brand = (p.brand || '').toLowerCase()
      const cat = (p.category || '').toLowerCase()
      return name.includes(q) || sku.includes(q) || brand.includes(q) || cat.includes(q)
    })
  }, [products, searchQuery])

  // Resetear página al buscar
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Cerrar popover al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE))
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredProducts, currentPage])

  if (selectedProduct) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/70 p-3 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={selectedProduct.image}
            alt={selectedProduct.name}
            className="h-12 w-12 rounded-xl object-cover bg-slate-100 shrink-0 ring-1 ring-glowe-pink/20"
          />
          <div className="min-w-0">
            <p className="font-bold text-glowe-dark text-sm truncate">{selectedProduct.name}</p>
            <p className="text-[10px] uppercase tracking-wider text-glowe-pink-accent font-semibold">
              SKU #{String(selectedProduct.id ?? selectedProduct._id).slice(-6)} • {selectedProduct.brand || 'Glowe Select'}
            </p>
          </div>
        </div>

        {/* Si está bloqueado por venir de la tabla de productos, ocultar botón Cambiar */}
        {!lockProductSelection && (
          <button
            type="button"
            onClick={onClearProduct}
            className="text-[11px] font-bold text-glowe-pink-accent hover:text-rose-600 underline shrink-0 ml-2 cursor-pointer"
          >
            Cambiar
          </button>
        )}
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative space-y-2 rounded-2xl border border-pink-200/80 bg-pink-50/40 p-4">
      <label className="block text-xs font-bold text-glowe-dark">
        Buscar producto para la oferta:
      </label>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-glowe-muted" />
        <Input
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setIsDropdownOpen(true)
          }}
          onFocus={() => setIsDropdownOpen(true)}
          placeholder="Escribe o haz clic para ver catálogo..."
          className="pl-10 w-full text-xs bg-white"
          autoFocus
        />
      </div>

      {/* Menú popover flotante que se sobrepone al contenido */}
      {isDropdownOpen && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-80 rounded-2xl border border-white/90 bg-white/98 p-2 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95">
          {paginatedProducts.length === 0 ? (
            <div className="py-6 text-center text-xs text-glowe-muted">
              No se encontraron productos coincidentes.
            </div>
          ) : (
            <div className="divide-y divide-pink-50 max-h-56 overflow-y-auto scrollbar-none hide-scrollbar">
              {paginatedProducts.map((p) => {
                const sku = String(p.id ?? p._id ?? '').slice(-6)
                const isSelected = selectedProduct && String(selectedProduct.id ?? selectedProduct._id) === String(p.id ?? p._id)

                return (
                  <button
                    key={p.id ?? p._id}
                    type="button"
                    onClick={() => {
                      onSelectProduct(p)
                      setIsDropdownOpen(false)
                      setSearchQuery('')
                    }}
                    className={`flex w-full items-center justify-between p-2 rounded-xl text-left text-xs transition cursor-pointer ${
                      isSelected ? 'bg-pink-100/70' : 'hover:bg-pink-50/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-8 w-8 rounded-lg object-cover bg-slate-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-glowe-dark truncate">{p.name}</p>
                        <p className="text-[10px] text-glowe-pink-accent font-bold uppercase">
                          {p.brand} • SKU #{sku}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="font-bold text-glowe-dark text-xs">
                        {formatCOP(p.price)}
                      </span>
                      {isSelected && <Check className="h-4 w-4 text-glowe-pink-accent" />}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Paginador reactivo si hay más de 8 productos */}
          {filteredProducts.length > ITEMS_PER_PAGE && (
            <div className="mt-2 flex items-center justify-between border-t border-pink-100 pt-2 px-2 text-[11px] font-semibold text-glowe-muted">
              <span>
                {filteredProducts.length} productos
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-lg border border-slate-200 bg-white text-glowe-dark hover:border-glowe-pink-accent disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="Página anterior"
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>
                <span className="text-[10px] text-glowe-dark font-bold">
                  {currentPage} de {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-lg border border-slate-200 bg-white text-glowe-dark hover:border-glowe-pink-accent disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="Página siguiente"
                >
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
