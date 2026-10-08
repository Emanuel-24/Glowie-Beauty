import { Link, useNavigate } from 'react-router-dom'

const socialLinks = [
  {
    name: 'Instagram',
    href: 'https://instagram.com',
    activeBg: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600',
  },
  {
    name: 'TikTok',
    href: 'https://tiktok.com',
    activeBg: 'bg-black',
  },
  {
    name: 'WhatsApp',
    href: 'https://wa.me/573000000000?text=Hola%2C%20me%20gustar%C3%ADa%20recibir%20asesor%C3%ADa%20personalizada%20para%20elegir%20mis%20productos.',
    activeBg: 'bg-emerald-500',
  },
]

const columns = [
  {
    title: 'Comprar',
    links: [
      { label: 'Maquillaje de Labios', to: '/maquillaje' },
      { label: 'Rostro & Rubor', to: '/maquillaje' },
      { label: 'Cuidado Capilar & Sérums', to: '/cabello' },
      { label: 'Ofertas Glow Deals', to: '/ofertas' },
      { label: 'Combos & Kits', to: '/combos' },
    ],
  },
  {
    title: 'Ayuda & Soporte',
    links: [
      { label: 'Preguntas Frecuentes' },
      { label: 'Políticas de Envío Colombia' },
      { label: 'Cambios y Devoluciones' },
      { label: 'Contacto directo WhatsApp' },
    ],
  },
]

export default function Footer() {
  const navigate = useNavigate()

  return (
    <footer className="relative border-t border-glowe-pink/40 bg-white/80 pt-16 pb-[calc(8rem+env(safe-area-inset-bottom))] text-glowe-dark xl:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-3.5 sm:gap-4 group">
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full border border-glowe-pink/40 p-1 bg-white shadow-md shadow-pink-100/80 shrink-0 transition-transform duration-300 group-hover:scale-105 flex items-center justify-center">
                <img
                  src="/Logo.png"
                  alt="GLOWE BEAUTY Logo"
                  loading="lazy"
                  className="w-full h-full rounded-full object-contain"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = 'https://placehold.co/120x120/FDE2E4/FF758F?text=GLOWE'
                  }}
                />
              </div>
              <div>
                <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-glowe-dark block leading-snug group-hover:text-glowe-pink-accent transition-colors">
                  GLOWE BEAUTY
                </span>
                <span className="block text-[10px] sm:text-[11px] font-semibold tracking-wider text-glowe-pink-accent uppercase mt-0.5">
                  Maquillaje & Cuidado Capilar
                </span>
              </div>
            </Link>
            <p className="text-xs text-glowe-muted leading-relaxed max-w-sm">
              Tu boutique multimarca aliada en Colombia. Distribuimos cosméticos, maquillaje y tratamientos capilares 100% originales de las marcas líderes para acompañar tu brillo natural cada día.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="font-bold text-xs uppercase tracking-wider text-glowe-pink-accent mb-4">
                {col.title}
              </h2>
              <ul className="space-y-2 text-xs text-glowe-muted">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <button onClick={() => navigate(link.to)} className="hover:text-glowe-dark transition-colors">
                        {link.label}
                      </button>
                    ) : (
                      <a href="#" className="hover:text-glowe-dark transition-colors">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Síguenos */}
          <div>
            <h2 className="font-bold text-xs uppercase tracking-wider text-glowe-pink-accent mb-4">Síguenos</h2>
            <p className="text-xs text-glowe-muted mb-4">Únete a nuestra comunidad en redes sociales:</p>
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold text-glowe-dark">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden px-3.5 py-2 rounded-full glass-panel border border-glowe-pink/40 shadow-xs font-medium text-glowe-dark transition-all duration-500 ease-in-out hover:shadow-md hover:border-transparent hover:-translate-y-0.5"
                >
                  <span
                    className={`absolute inset-0 ${social.activeBg} opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100 pointer-events-none`}
                    aria-hidden="true"
                  />
                  <span className="relative z-10 transition-colors duration-500 ease-in-out group-hover:text-white">
                    {social.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-glowe-pink/30 pt-8 text-center text-[11px] text-glowe-muted sm:flex-row sm:text-left">
          <p>© 2026 GLOWE BEAUTY Colombia. Todos los derechos reservados.</p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 font-medium sm:justify-end">
            <span className="text-[11px] text-glowe-muted mr-1">Métodos de pago:</span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-xs text-xs font-semibold text-slate-700 backdrop-blur-xs transition hover:bg-white hover:border-slate-300">
              <span role="img" aria-label="Efectivo" className="text-sm">💵</span>
              <span>Efectivo</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-xs text-xs font-semibold text-slate-700 backdrop-blur-xs transition hover:bg-white hover:border-slate-300">
              <img
                src="/Bancolombia-Logo.png"
                alt="Bancolombia"
                className="h-3.5 sm:h-4 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <span>Bancolombia</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-xs text-xs font-semibold text-slate-700 backdrop-blur-xs transition hover:bg-white hover:border-slate-300">
              <img
                src="/Nequi-Logo.png"
                alt="Nequi"
                className="h-3.5 sm:h-4 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <span>Nequi</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
