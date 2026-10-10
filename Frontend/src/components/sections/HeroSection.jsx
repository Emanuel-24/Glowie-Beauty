import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Orbit } from '@uiball/loaders'
import Button from '../ui/Button'
import Card from '../ui/Card'
import { getSiteConfig, defaultSiteConfig } from '../../services/siteConfigService'
import { getTopSellerProduct } from '../../services/productService'
import { getWhatsAppUrl } from '@/data/contact'

gsap.registerPlugin(ScrollTrigger)

export default function HeroSection() {
  const navigate = useNavigate()
  const rootRef = useRef(null)
  const [heroConfig, setHeroConfig] = useState(null)
  const [topSeller, setTopSeller] = useState(null)
  const [configLoaded, setConfigLoaded] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const goToDiscover = (params = '') => navigate(`/descubrir${params}`)

  const activeHeroConfig = heroConfig || defaultSiteConfig.heroConfig
  const featuredProduct = activeHeroConfig?.featuredProduct || topSeller
  const featuredId = featuredProduct?.id || featuredProduct?._id || activeHeroConfig?.featuredProductId
  const topSellerId = topSeller?.id || topSeller?._id

  // Solo resolver la imagen cuando la configuración haya respondido
  const featuredImage = configLoaded
    ? (featuredProduct?.image ||
       featuredProduct?.images?.[0] ||
       'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80')
    : null

  const featuredPriceFormatted =
    featuredProduct?.price != null
      ? `$${Number(featuredProduct.price).toLocaleString('es-CO')} COP`
      : '$45.000 COP'

  useEffect(() => {
    if (featuredImage) {
      setImageLoading(true)
    }
  }, [featuredImage])

  useEffect(() => {
    let active = true

    Promise.all([
      getSiteConfig().catch(() => null),
      getTopSellerProduct().catch(() => null),
    ]).then(([config, prod]) => {
      if (!active) return
      if (config?.heroConfig) {
        setHeroConfig(config.heroConfig)
      }
      if (prod) {
        setTopSeller(prod)
      }
      setConfigLoaded(true)
    })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!rootRef.current) return undefined

    const ctx = gsap.context(() => {
      const items = rootRef.current.querySelectorAll('[data-hero-item]')
      gsap.from(items, {
        y: 28,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.1,
      })

      // Las tarjetas flotantes deben mantenerse visibles con contraste estable.
      // El efecto de GSAP sobre opacity hacía que se desvanecieran al cargar.
    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} id="inicio" className="relative overflow-x-clip pt-8 pb-16 lg:pt-16 lg:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Text Column */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <div data-hero-item className="inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border border-glowe-pink/50 px-4 py-2 text-xs font-semibold text-glowe-dark glass-panel">
              <span className="w-2 h-2 rounded-full bg-glowe-pink-accent animate-ping" />
              <span className="text-glowe-pink-accent font-bold">✨ Tienda Multimarca 2026</span>
              <span className="text-glowe-muted">| Curaduría & Care</span>
            </div>

            <h1 data-hero-item className="font-serif text-3xl font-bold leading-[1.15] tracking-tight text-glowe-dark min-[380px]:text-4xl sm:text-5xl lg:text-6xl">
              Tu belleza, tu estilo, <br className="hidden sm:block" />
              <span className="relative inline-block text-glowe-pink-accent">
                tu Glowe.
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-glowe-yellow-dark opacity-70"
                  viewBox="0 0 100 20"
                  preserveAspectRatio="none"
                >
                  <path d="M0 15 Q 50 0 100 15" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p data-hero-item className="text-base sm:text-lg text-glowe-muted max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Tu tienda multimarca de belleza y cuidado capilar en Colombia. Seleccionamos y distribuimos las mejores marcas del mercado para que brilles todos los días con productos 100% originales y de alta calidad.
            </p>

            <div data-hero-item className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => goToDiscover()}
                className="w-full sm:w-auto"
              >
                Comprar ahora ✨
              </Button>
              <Button
                variant="glass"
                size="lg"
                onClick={() => goToDiscover()}
                className="w-full sm:w-auto"
              >
                Explorar productos 🔍
              </Button>
            </div>

            <div data-hero-item className="pt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-glowe-muted">
              <div className="flex items-center gap-1.5">
                <span className="text-glowe-pink-accent text-base">🌸</span> +10 Usuari@s Felices
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-glowe-yellow-accent text-base">⚡</span> Envíos a Toda Colombia
              </div>
              <a
                href={getWhatsAppUrl('¡Hola! Me gustaría recibir asesoría personalizada para elegir mis productos ✨')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors"
              >
                <span className="text-glowe-blue-accent text-base">💬</span> Asesoría por WhatsApp
              </a>
            </div>
          </div>

          {/* Right Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div
                className="relative rounded-3xl overflow-hidden glass-panel p-3.5 sm:p-4 border-white/90 shadow-2xl cursor-pointer group"
                onClick={() => {
                  if (featuredId) navigate(`/producto/${featuredId}`)
                  else goToDiscover()
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    if (featuredId) navigate(`/producto/${featuredId}`)
                    else goToDiscover()
                  }
                }}
                aria-label={`Ver producto destacado: ${featuredProduct?.name || 'Glow Natural Everyday'}`}
              >
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-glowe-pink/40 via-glowe-yellow/30 to-glowe-blue/40 flex items-center justify-center">
                  {(!configLoaded || imageLoading || !featuredImage) && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                      <Orbit size={34} color="#ff758f" speed={1.4} />
                    </div>
                  )}
                  {featuredImage && (
                    <img
                      key={featuredImage}
                      src={featuredImage}
                      alt={featuredProduct?.name || 'Modelo con maquillaje natural y piel radiante, imagen de la rutina Glow Natural Everyday de GLOWE BEAUTY'}
                      onLoad={() => setImageLoading(false)}
                      onError={() => setImageLoading(false)}
                      className={`w-full h-full object-cover rounded-2xl transition-all duration-700 group-hover:scale-105 ${
                        imageLoading ? 'opacity-0' : 'opacity-100'
                      }`}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-glowe-dark/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-xs uppercase tracking-widest font-bold text-glowe-yellow">
                      {activeHeroConfig?.tagline || 'Rutina Completa'}
                    </span>
                    <p className="text-base sm:text-lg font-bold font-serif line-clamp-1">
                      {featuredProduct?.name || activeHeroConfig?.title || 'Glow Natural Everyday'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating interactive badge (editable desde el admin) */}
              <Button
                variant="glass"
                size="sm"
                onClick={() => {
                  if (featuredId) navigate(`/producto/${featuredId}`)
                  else goToDiscover()
                }}
                className="hero-float-card absolute top-1/2 -right-2 sm:-right-8 -translate-y-1/2 border border-glowe-pink bg-white/95 text-glowe-pink-accent opacity-100 shadow-md hover:scale-110 z-20 inline-flex font-bold text-xs sm:text-xs cursor-pointer"
                style={{ opacity: 1 }}
              >
                {activeHeroConfig?.floatingBadgeText || '✨ ¡Nuevo Lip Serum!'}
              </Button>

              {/* Micro tarjeta 1: El más vendido (información fija en código) */}
              <Card
                radius="2xl"
                className="absolute -top-3 -left-2 sm:-top-4 sm:-left-6 px-3 py-2 sm:px-4 sm:py-2.5 flex items-center gap-2.5 sm:gap-3 shadow-lg hero-float-card bg-white/95 opacity-100 cursor-pointer hover:scale-105 transition-transform max-w-[170px] sm:max-w-none z-20 border border-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glowe-pink-accent"
                style={{ opacity: 1 }}
                role="button"
                tabIndex={0}
                aria-label={`Ver producto más vendido: ${featuredProduct?.name || 'Glow Natural Everyday'}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    if (featuredId) navigate(`/producto/${featuredId}`)
                    else goToDiscover()
                  }
                }}
                onClick={() => {
                  if (featuredId) navigate(`/producto/${featuredId}`)
                  else goToDiscover()
                }}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-glowe-yellow flex items-center justify-center text-xs sm:text-sm shadow-inner shrink-0">⭐</div>
                <div className="min-w-0">
                  <span className="block text-[11px] sm:text-xs font-bold text-glowe-dark leading-tight">#1 Más vendido</span>
                  <span className="block text-[9px] sm:text-[10px] text-glowe-muted hover:transition-colors font-medium truncate">
                    ¡Lo que más prefieren!
                  </span>
                </div>
              </Card>

              {/* Micro tarjeta 2: Precio del producto destacado*/}
              <Card
                radius="2xl"
                className="absolute -bottom-3 -right-2 sm:-bottom-6 sm:-right-4 px-3 py-2 sm:px-4 sm:py-3 flex items-center gap-2 sm:gap-3 shadow-lg hero-float-card bg-white/95 opacity-100 cursor-pointer hover:scale-105 transition-transform border border-white/80 max-w-[175px] sm:max-w-none z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glowe-pink-accent"
                style={{ opacity: 1 }}
                role="button"
                tabIndex={0}
                aria-label={`Ver producto: ${featuredProduct?.name || 'Glow Natural Everyday'} con precio ${featuredPriceFormatted}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    if (featuredId) navigate(`/producto/${featuredId}`)
                    else goToDiscover()
                  }
                }}
                onClick={() => {
                  if (featuredId) navigate(`/producto/${featuredId}`)
                  else goToDiscover()
                }}
              >
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-glowe-pink/40 to-glowe-yellow/50 flex items-center justify-center text-xs sm:text-sm shadow-inner shrink-0">
                  🏷️
                </div>
                <div className="min-w-0">
                  <span className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-glowe-pink-accent leading-tight">
                    Precio Especial
                  </span>
                  <span className="block text-[11px] sm:text-xs font-black text-glowe-dark tracking-tight">
                    {featuredPriceFormatted}
                  </span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
