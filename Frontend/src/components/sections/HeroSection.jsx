import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Button from '../ui/Button'
import Card from '../ui/Card'

gsap.registerPlugin(ScrollTrigger)

const microCards = [
  {
    className: 'absolute -top-4 -left-6 px-4 py-2.5 flex items-center gap-3 shadow-lg',
    inner: (
      <>
        <div className="w-8 h-8 rounded-full bg-glowe-yellow flex items-center justify-center text-sm shadow-inner">⭐</div>
        <div>
          <span className="block text-xs font-bold text-glowe-dark">#1 Best Seller</span>
          <span className="block text-[10px] text-glowe-muted">Brillo Labial HydraGlow</span>
        </div>
      </>
    ),
  },
  {
    className: 'absolute -bottom-6 -right-4 px-4 py-3 flex items-center gap-3 shadow-lg',
    inner: (
      <>
        <div className="w-10 h-10 rounded-full bg-glowe-pink flex items-center justify-center text-base shadow-inner">💖</div>
        <div>
          <div className="flex text-amber-400 text-xs">★★★★★</div>
          <span className="block text-xs font-bold text-glowe-dark">4.9/5 Rating</span>
          <span className="block text-[10px] text-glowe-muted">+1.2k Calificaciones</span>
        </div>
      </>
    ),
  },
]

export default function HeroSection() {
  const navigate = useNavigate()
  const rootRef = useRef(null)
  const goToDiscover = (params = '') => navigate(`/descubrir${params}`)

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
              <span className="text-glowe-pink-accent font-bold">✨ Nueva Colección 2026</span>
              <span className="text-glowe-muted">| Maquillaje & Care</span>
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
              Maquillaje y cuidado capilar diseñados para hacerte brillar todos los días. Productos
              accesibles, auténticos y fáciles de amar.
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
                <span className="text-glowe-pink-accent text-base">🌸</span> 100% Cruelty Free
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-glowe-yellow-accent text-base">⚡</span> Envíos Rápidos Colombia
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-glowe-blue-accent text-base">💖</span> +10k Usuarias Felices
              </div>
            </div>
          </div>

          {/* Right Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative rounded-3xl overflow-hidden glass-panel p-4 border-white/90 shadow-2xl">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-glowe-pink/40 via-glowe-yellow/30 to-glowe-blue/40">
                  <img
                    src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
                    alt="Modelo con maquillaje natural y piel radiante, imagen de la rutina Glow Natural Everyday de GLOWE BEAUTY"
                    className="w-full h-full object-cover rounded-2xl transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-glowe-dark/50 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-xs uppercase tracking-widest font-bold text-glowe-yellow">Rutina Completa</span>
                    <p className="text-lg font-bold font-serif">Glow Natural Everyday</p>
                  </div>
                </div>
              </div>

              {/* Floating interactive badge */}
              <Button
                variant="glass"
                size="sm"
                onClick={() => goToDiscover()}
                className="hero-float-card absolute top-1/2 -right-4 hidden border-glowe-pink bg-white/95 text-glowe-pink-accent opacity-100 shadow-md hover:scale-110 sm:inline-flex sm:-right-8"
                style={{ opacity: 1 }}
              >
                ✨ ¡Nuevo Lip Serum!
              </Button>

              {microCards.map((card, i) => (
                <Card
                  key={i}
                  radius="2xl"
                  className={`${card.className} hero-float-card hidden bg-white/95 opacity-100 sm:flex`}
                  style={{ opacity: 1 }}
                >
                  {card.inner}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
