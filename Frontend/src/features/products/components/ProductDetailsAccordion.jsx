export default function ProductDetailsAccordion({ product, detailsInfo }) {
  if (!detailsInfo) return null

  return (
    <details className="group mt-4 rounded-2xl border border-glowe-pink-soft bg-white/70">
      <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm font-bold text-glowe-dark">
        <span>Detalles de {product?.name}</span>
        <span aria-hidden="true" className="transition-transform group-open:rotate-180">v</span>
      </summary>
      <div className="space-y-4 px-4 pb-4 pt-2">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-glowe-muted mb-2">Ingredientes</h3>
          {detailsInfo?.ingredients?.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-sm text-glowe-muted">
              {detailsInfo.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
            </ul>
          ) : (
            <p className="text-sm text-glowe-muted">Informacion de ingredientes no disponible para esta categoria.</p>
          )}
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-glowe-muted mb-2">Como usarlo</h3>
          <p className="text-sm text-glowe-muted leading-relaxed">{detailsInfo.tips || 'Sigue las indicaciones del empaque.'}</p>
        </div>
      </div>
    </details>
  )
}
