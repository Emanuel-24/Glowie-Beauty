const badges = [
  { icon: '🚚', title: 'Envíos a Toda Colombia', sub: 'Rápidos y seguros a tu puerta.' },
  { icon: '🏷️', title: '100% Originales & Multimarca', sub: 'Garantía en todas las marcas aliadas.' },
  { icon: '💗', title: 'Curaduría Experta', sub: 'Selección de los mejores productos del mercado.' },
  { icon: '✨', title: 'Asesoría por WhatsApp', sub: 'Te ayudamos a elegir el producto ideal.' },
]

export default function TrustBadges() {
  return (
    <section className="py-12 border-y border-white/60 bg-white/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-serif text-2xl font-bold text-glowe-dark mb-8">
          Comprar belleza debería ser fácil ✨
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((badge) => (
            <div key={badge.title} className="p-4 glass-panel rounded-2xl border-white">
              <span className="text-3xl mb-2 block">{badge.icon}</span>
              <h3 className="font-bold text-xs text-glowe-dark">{badge.title}</h3>
              <p className="text-[11px] text-glowe-muted mt-1">{badge.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
