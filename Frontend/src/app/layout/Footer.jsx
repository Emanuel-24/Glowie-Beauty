import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getWhatsAppUrl } from '@/shared/utils/whatsapp'
import InfoLegalModal from './InfoLegalModal'

const socialLinks = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/glowebeautytienda?psln=MTk2ZWswY2I3dWhnbw==',
    activeBg: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600',
  },
  {
    name: 'WhatsApp',
    href: getWhatsAppUrl('Hola Glowe Beauty, deseo contactarme con una asesora comercial.'),
    activeBg: 'bg-emerald-500',
  },
]

const LEGAL_TOPICS = {
  faq: {
    title: 'Preguntas Frecuentes',
    icon: '❓',
    showWhatsApp: true,
    content: (
      <>
        <p className="font-semibold text-glowe-dark">¿Los productos son 100% originales?</p>
        <p>Sí, en Glowe Beauty distribuimos cosméticos y tratamientos capilares de marcas aliadas oficiales reconocidas nacional e internacionalmente con trazabilidad garantizada.</p>
        <p className="font-semibold text-glowe-dark pt-2">¿Cómo realizo mi pedido?</p>
        <p>Agrega tus productos favoritos al carrito, procede al checkout para ingresar tus datos de envío y finaliza coordinando la entrega y medio de pago por nuestro canal oficial de WhatsApp.</p>
        <p className="font-semibold text-glowe-dark pt-2">¿Cuánto tarda en llegar mi pedido?</p>
        <p>Los envíos nacionales en Colombia toman usualmente de 2 a 5 días hábiles dependiendo de tu ciudad o municipio.</p>
      </>
    ),
  },
  shipping: {
    title: 'Políticas de Envío Colombia',
    icon: '🚚',
    showWhatsApp: true,
    content: (
      <>
        <p>Despachamos a nivel nacional mediante las principales transportadoras de Colombia (Coordinadora, Servientrega, Interrapidísimo).</p>
        <p className="font-semibold text-glowe-dark pt-2">Envío Gratis:</p>
        <p>Aplica para pedidos superiores a $150.000 COP en territorio nacional continental.</p>
        <p className="font-semibold text-glowe-dark pt-2">Seguimiento:</p>
        <p>Una vez generado tu despacho, te enviamos el número de guía correspondiente por WhatsApp para rastreo en tiempo real.</p>
      </>
    ),
  },
  returns: {
    title: 'Cambios y Devoluciones',
    icon: '🔄',
    showWhatsApp: true,
    content: (
      <>
        <p>Por razones de bioseguridad y regulación sanitaria para productos cosméticos y de cuidado personal, solo se aceptan cambios o garantías por defectos de fábrica comprobados o averías durante el transporte.</p>
        <p className="font-semibold text-glowe-dark pt-2">Plazo para reporte:</p>
        <p>Debes reportar cualquier anomalía dentro de las 48 horas siguientes a la recepción del paquete adjuntando fotos/videos del empaque original.</p>
      </>
    ),
  },
  terms: {
    title: 'Términos y Condiciones',
    icon: '📜',
    showWhatsApp: false,
    content: (
      <>
        <p>El uso de la tienda Glowe Beauty implica la aceptación plena de los términos de servicio para compras minoristas en Colombia.</p>
        <p className="font-semibold text-glowe-dark pt-2">Precios y Disponibilidad:</p>
        <p>Todos los precios están expresados en pesos colombianos (COP). Glowe Beauty opera un modelo de inventario dinámico con confirmación directa previa al despacho.</p>
      </>
    ),
  },
  privacy: {
    title: 'Políticas de Privacidad',
    icon: '🔒',
    showWhatsApp: false,
    content: (
      <>
        <p>En cumplimiento de la Ley 1581 de 2012 de Colombia sobre protección de datos personales, Glowe Beauty se compromete a salvaguardar tu información privada.</p>
        <p className="font-semibold text-glowe-dark pt-2">Uso de datos:</p>
        <p>Tus datos de contacto, dirección y cédula son utilizados exclusivamente para la facturación, despacho de órdenes y soporte posventa.</p>
      </>
    ),
  },
}

export default function Footer() {
  const navigate = useNavigate()
  const [modalTopic, setModalTopic] = useState(null)

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
        { label: 'Preguntas Frecuentes', topicKey: 'faq' },
        { label: 'Políticas de Envío Colombia', topicKey: 'shipping' },
        { label: 'Cambios y Devoluciones', topicKey: 'returns' },
        {
          label: 'Contacto directo WhatsApp',
          href: getWhatsAppUrl('Hola Glowe Beauty, requiero asistencia personalizada con un asesor.'),
          external: true,
        },
      ],
    },
  ]

  return (
    <>
      <footer className="relative border-t border-glowe-pink/40 bg-white/80 pt-6 pb-[calc(8rem+env(safe-area-inset-bottom))] text-glowe-dark xl:pb-12">
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
              <div className="relative top-4" key={col.title}>
                <h2 className="font-bold text-xs uppercase tracking-wider text-glowe-pink-accent mb-4">
                  {col.title}
                </h2>
                <ul className="space-y-2 text-xs text-glowe-muted">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.to ? (
                        <button
                          type="button"
                          onClick={() => navigate(link.to)}
                          className="hover:text-glowe-dark transition-colors cursor-pointer text-left focus-visible:outline-none focus-visible:underline"
                        >
                          {link.label}
                        </button>
                      ) : link.topicKey ? (
                        <button
                          type="button"
                          onClick={() => setModalTopic(LEGAL_TOPICS[link.topicKey])}
                          className="hover:text-glowe-dark transition-colors cursor-pointer text-left focus-visible:outline-none focus-visible:underline"
                        >
                          {link.label}
                        </button>
                      ) : link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-glowe-dark transition-colors inline-flex items-center gap-1 focus-visible:outline-none focus-visible:underline"
                        >
                          {link.label}
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Síguenos */}
            <div className="relative top-4">
              <h2 className="font-bold text-xs uppercase tracking-wider text-glowe-pink-accent mb-4">Síguenos</h2>
              <p className="text-xs text-glowe-muted mb-4">Únete a nuestra comunidad en redes sociales:</p>
              <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold text-glowe-dark">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative overflow-hidden px-3.5 py-2 rounded-full glass-panel border border-glowe-pink/40 shadow-xs font-medium text-glowe-dark transition-all duration-500 ease-in-out hover:shadow-md hover:border-transparent hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glowe-pink-accent"
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
            <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <span>© 2026 GLOWE BEAUTY Colombia. Todos los derechos reservados.</span>
              <span className="text-glowe-pink/60 hidden sm:inline" aria-hidden="true">•</span>
              <button
                type="button"
                onClick={() => setModalTopic(LEGAL_TOPICS.terms)}
                className="hover:text-glowe-dark underline transition-colors cursor-pointer"
              >
                Términos
              </button>
              <span className="text-glowe-pink/60 hidden sm:inline" aria-hidden="true">•</span>
              <button
                type="button"
                onClick={() => setModalTopic(LEGAL_TOPICS.privacy)}
                className="hover:text-glowe-dark underline transition-colors cursor-pointer"
              >
                Privacidad
              </button>
            </div>

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

      <InfoLegalModal
        isOpen={Boolean(modalTopic)}
        onClose={() => setModalTopic(null)}
        topic={modalTopic}
      />
    </>
  )
}
