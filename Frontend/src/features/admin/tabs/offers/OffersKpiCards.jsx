export default function OffersKpiCards({
  activeOffersCount = 0,
  featuredOffersCount = 0,
  avgDiscount = 0,
  totalProducts = 0,
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-[1.6rem] border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-2xl">⚡</span>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
            {Math.round((activeOffersCount / (totalProducts || 1)) * 100)}% del catálogo
          </span>
        </div>
        <p className="mt-3 text-xs font-semibold text-glowe-muted uppercase tracking-wider">Ofertas Activas</p>
        <p className="mt-1 font-serif text-3xl font-bold text-glowe-dark">
          {activeOffersCount}{' '}
          <span className="text-sm font-sans font-normal text-glowe-muted">de {totalProducts} productos</span>
        </p>
      </div>

      <div className="rounded-[1.6rem] border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-2xl">⭐</span>
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
            {featuredOffersCount}/3 seleccionadas
          </span>
        </div>
        <p className="mt-3 text-xs font-semibold text-glowe-muted uppercase tracking-wider">Destacadas en Glow Deals</p>
        <p className="mt-1 font-serif text-3xl font-bold text-glowe-dark">
          {featuredOffersCount} <span className="text-sm font-sans font-normal text-glowe-muted">máx. 3 en carrusel</span>
        </p>
      </div>

      <div className="rounded-[1.6rem] border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-2xl">🏷️</span>
          <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800">Promedio OFF</span>
        </div>
        <p className="mt-3 text-xs font-semibold text-glowe-muted uppercase tracking-wider">Descuento Promedio</p>
        <p className="mt-1 font-serif text-3xl font-bold text-glowe-dark">
          {avgDiscount}% <span className="text-sm font-sans font-normal text-glowe-muted">de ahorro medio</span>
        </p>
      </div>
    </section>
  )
}
