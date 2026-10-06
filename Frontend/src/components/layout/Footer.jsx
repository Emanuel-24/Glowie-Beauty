import { useNavigate } from 'react-router-dom'
import NewsletterForm from '../ui/NewsletterForm'

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
            <div className="flex items-center gap-3">
              <img
                src="/Logo.png"
                alt="GLOWE BEAUTY Logo"
                loading="lazy"
                className="w-12 h-12 rounded-full border border-glowe-pink p-0.5 object-contain bg-white"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = 'https://placehold.co/120x120/FDE2E4/FF758F?text=GLOWE'
                }}
              />
              <div>
                <span className="font-serif text-lg font-bold">GLOWE BEAUTY</span>
                <span className="block text-[10px] text-glowe-muted tracking-widest uppercase">
                  Maquillaje & Cabello
                </span>
              </div>
            </div>
            <p className="text-xs text-glowe-muted leading-relaxed">
              Tu belleza, tu estilo, tu Glowe. Tienda multimarca de belleza y cuidado capilar. Distribuimos las mejores marcas para hacerte brillar todos los días con productos 100% originales.
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

          {/* Síguenos + Newsletter */}
          <div>
            <h2 className="font-bold text-xs uppercase tracking-wider text-glowe-pink-accent mb-4">Síguenos</h2>
            <p className="text-xs text-glowe-muted mb-3">Únete a nuestra comunidad en redes sociales:</p>
            <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-glowe-dark">
              {['Instagram', 'TikTok', 'WhatsApp'].map((social) => (
                <a key={social} href="#" className="px-3 py-2 rounded-full glass-panel hover:bg-glowe-pink transition-all">
                  {social}
                </a>
              ))}
            </div>

            <NewsletterForm
              id="newsletter-footer-email"
              size="sm"
              successMessage="💚 ¡Suscripción exitosa! Te escribiremos pronto."
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-glowe-pink/30 pt-8 text-center text-[11px] text-glowe-muted sm:flex-row sm:text-left">
          <p>© 2026 GLOWE BEAUTY Colombia. Todos los derechos reservados.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-semibold sm:justify-end">
            <span>💳 PSE</span>
            <span>•</span>
            <span>Visa / Mastercard</span>
            <span>•</span>
            <span>Efecty</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
