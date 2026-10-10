import Button from '@/shared/components/ui/Button'
import { formatCOP } from '@/features/admin/constants'

export default function OffersTable({
  filteredOfferProducts = [],
  onToggleOffer,
  onOpenOfferModal,
}) {
  return (
    <div className="overflow-hidden rounded-[1.8rem] border border-white/80 bg-white/75 shadow-sm backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-pink-100 bg-white/60 text-[10px] font-bold uppercase tracking-[0.16em] text-glowe-muted">
              <th className="py-3.5 pl-6 pr-3">Producto</th>
              <th className="px-3 py-3.5">Precio Regular</th>
              <th className="px-3 py-3.5">Precio Oferta</th>
              <th className="px-3 py-3.5">% Descuento</th>
              <th className="px-3 py-3.5">Vigencia</th>
              <th className="px-3 py-3.5">Top 3</th>
              <th className="px-3 py-3.5 text-center">Estado Oferta</th>
              <th className="py-3.5 pl-3 pr-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-50">
            {filteredOfferProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-sm font-semibold text-glowe-muted">
                  No se encontraron productos que coincidan con el filtro.
                </td>
              </tr>
            ) : (
              filteredOfferProducts.map((product) => {
                const regular =
                  product.oldPrice && product.oldPrice > product.price ? product.oldPrice : product.price
                const offer = product.isOffer ? product.price : regular
                const discountPct = product.isOffer
                  ? product.discountPercentage || Math.round(((regular - offer) / regular) * 100)
                  : 0

                return (
                  <tr key={product.id} className="transition hover:bg-white/80">
                    <td className="py-3 pl-6 pr-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-10 w-10 shrink-0 rounded-xl object-cover shadow-sm bg-slate-100"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-bold text-glowe-dark">{product.name}</p>
                          <p className="text-[10px] uppercase tracking-wider text-glowe-pink-accent font-semibold">
                            {product.brand} • <span className="text-glowe-muted">{product.category}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-medium text-glowe-muted">{formatCOP(regular)}</td>
                    <td className="px-3 py-3 font-bold text-glowe-dark">{product.isOffer ? formatCOP(offer) : '—'}</td>
                    <td className="px-3 py-3">
                      {product.isOffer ? (
                        <span className="inline-block rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                          -{discountPct}% OFF
                        </span>
                      ) : (
                        <span className="text-glowe-muted font-normal">Sin descuento</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-[11px] text-glowe-muted">
                      {product.offerStartDate || product.offerEndDate ? (
                        <div>
                          {product.offerStartDate && <div>Desde: {String(product.offerStartDate).split('T')[0]}</div>}
                          {product.offerEndDate && <div>Hasta: {String(product.offerEndDate).split('T')[0]}</div>}
                        </div>
                      ) : (
                        <span>Sin límite de fecha</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {product.isFeaturedOffer ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                          ⭐ Sí
                        </span>
                      ) : (
                        <span className="text-glowe-muted">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => onToggleOffer(product)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 ${
                          product.isOffer ? 'bg-gradient-to-r from-pink-500 to-amber-500' : 'bg-slate-200'
                        }`}
                        role="switch"
                        aria-checked={Boolean(product.isOffer)}
                        title={product.isOffer ? 'Desactivar oferta' : 'Activar oferta'}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            product.isOffer ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-3 pl-3 pr-6 text-right">
                      <Button
                        size="sm"
                        variant="glass"
                        onClick={() => onOpenOfferModal(product)}
                        className="text-xs"
                      >
                        Configurar ⚡
                      </Button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
