import { Zap } from 'lucide-react'
import ActionButton from '@/features/admin/components/ActionButton'

export function getProductColumns({
  onView,
  onEdit,
  onConfigureOffer,
  onToggleStatus,
  onAnnul,
}) {
  return [
    {
      key: 'number',
      header: '#',
      className: 'w-12',
      render: (row) => <span className="font-bold text-glowe-muted">{row.number}</span>,
    },
    {
      key: 'image',
      header: 'Imagen',
      render: (row) => (
        <img
          src={row.image}
          alt={row.name}
          className={`h-11 w-11 rounded-xl object-cover ring-1 ring-glowe-pink/20 ${
            row.status === 'anulado' ? 'opacity-40 grayscale' : ''
          }`}
          loading="lazy"
        />
      ),
    },
    {
      key: 'name',
      header: 'Nombre & Marca',
      render: (row) => (
        <div className={row.status === 'anulado' ? 'opacity-60' : ''}>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-glowe-dark">{row.name}</p>
            {row.status === 'anulado' && (
              <span className="rounded-full bg-stone-200 px-2 py-0.2 text-[9px] font-bold uppercase text-stone-600">
                Anulado
              </span>
            )}
            {row.status === 'inactivo' && (
              <span className="rounded-full bg-amber-100 px-2 py-0.2 text-[9px] font-bold uppercase text-amber-700">
                Inactivo
              </span>
            )}
          </div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-glowe-pink-accent font-bold">
            {row.brand || 'Glowe Select'} • <span className="text-glowe-muted">{row.badge}</span>
          </p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Categoría',
      render: (row) => (
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-glowe-muted">
          {row.category}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Precio de venta',
      render: (row) => (
        <div>
          {row.isOffer && row.oldPrice && (
            <span className="block text-[10px] text-glowe-muted line-through">{row.oldPrice}</span>
          )}
          <span className="font-bold text-glowe-dark">{row.price}</span>
        </div>
      ),
    },
    {
      key: 'costPrice',
      header: 'Precio coste',
      render: (row) => (
        <span className="text-xs font-medium text-glowe-muted">{row.costPrice}</span>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (row) => {
        const qty = Number(row.stock || 0)
        const isOut = qty <= 0
        const isLow = qty > 0 && qty <= 3
        return (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
              isOut
                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                : isLow
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}
          >
            {isOut ? 'Agotado' : qty}
          </span>
        )
      },
    },
    {
      key: 'statusToggle',
      header: 'Estado',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={row.status === 'anulado'}
            onClick={() => onToggleStatus(row)}
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-all cursor-pointer ${
              row.status === 'activo'
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                : row.status === 'inactivo'
                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                : 'bg-stone-200 text-stone-600 opacity-60 cursor-not-allowed'
            }`}
            title="Alternar entre Activo e Inactivo"
          >
            {row.status === 'activo' ? 'Activo' : row.status === 'inactivo' ? 'Inactivo' : 'Anulado'}
          </button>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <ActionButton
            type="view"
            title="Ver detalle del producto"
            onClick={() => onView(row.rawProduct || row)}
          />
          <ActionButton
            type="edit"
            title="Editar producto"
            disabled={row.status === 'anulado'}
            onClick={() => onEdit(row.rawProduct || row)}
          />
          <ActionButton
            type="offer"
            title="Crear/Gestionar oferta flash"
            disabled={row.status === 'anulado'}
            onClick={() => onConfigureOffer?.(row.rawProduct || row)}
            className={row.isOffer ? 'bg-amber-100 text-amber-600 hover:bg-amber-200 ring-1 ring-amber-300' : ''}
          />
          <ActionButton
            type="ban"
            title={
              row.salesCount > 0
                ? 'No se puede anular un producto con historial de ventas'
                : 'Anular producto'
            }
            disabled={row.status === 'anulado' || row.salesCount > 0}
            onClick={() => onAnnul(row)}
          />
        </div>
      ),
    },
  ]
}
