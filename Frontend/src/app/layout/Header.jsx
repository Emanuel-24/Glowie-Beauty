import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Heart, Search, ShoppingBag } from 'lucide-react'
import { useAuth, UserMenuDropdown } from '@/features/auth'
import { useCart } from '@/features/cart'
import { useFavorites } from '@/features/favorites'
import { useScrollY } from '@/shared/hooks/useScrollY'
import { ROUTES } from '@/app/routes'
import Button from '@/shared/components/ui/Button'
import SearchModal from '@/features/products/components/SearchModal'
import PillGroup from '@/shared/components/ui/PillGroup'

const navLinks = [
  { value: '/', label: 'Inicio' },
  { value: '/maquillaje', label: 'Maquillaje' },
  { value: '/cabello', label: 'Cabello' },
  {
    value: '/ofertas',
    label: '💛 Ofertas',
    activeClass:
      'bg-glowe-yellow text-amber-800 font-bold shadow-sm hover:bg-glowe-yellow-dark',
    inactiveClass: 'font-semibold text-amber-700 hover:bg-glowe-yellow/60',
  },
  { value: '/combos', label: 'Combos' },
  { value: '/descubrir', label: 'Descubrir' },
]

const navPills = navLinks

export default function Header({ products = [] }) {
  const scrolled = useScrollY(10)
  const [searchOpen, setSearchOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { isAuthenticated } = useAuth()
  const { itemCount, toggleCart } = useCart()
  const { count: favoritesCount } = useFavorites()

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b shadow-sm transition-all duration-300 ${
          scrolled
            ? 'bg-white/75 backdrop-blur-md border-white shadow-glass'
            : 'glass-panel border-white/70'
        }`}
      >
        {/* Announcement Bar */}
        <div className="bg-gradient-to-r from-glowe-pink via-glowe-yellow to-glowe-blue px-4 py-1.5 text-center text-[11px] font-semibold tracking-wide text-glowe-dark sm:text-xs">
          <span>✨ ¡Envíos GRATIS a toda Colombia por compras superiores a $150.000! 🚚</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-2 sm:h-20">
            {/* Official Logo */}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex shrink-0 items-center gap-2 sm:gap-3 group text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glowe-pink-accent focus-visible:ring-offset-2 rounded-xl"
              aria-label="Ir a página de inicio de Glowe Beauty"
            >
              <div className="relative h-11 w-11 rounded-full p-0.5 shadow-sm transition-transform duration-300 group-hover:scale-105 sm:h-14 sm:w-14">
                <img
                  src="/Logo-sencillo.webp"
                  alt="GLOWE BEAUTY Logo"
                  className="w-full h-full object-contain rounded-full bg-white p-0.5"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src =
                      'https://placehold.co/120x120/FDE2E4/FF758F?text=GLOWE'
                  }}
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="block font-serif text-base sm:text-xl font-bold tracking-tight text-glowe-dark group-hover:text-glowe-pink-accent transition-colors leading-tight">
                  GLOWE BEAUTY
                </span>
                <span className="hidden min-[380px]:block text-[9px] sm:text-[10px] tracking-widest text-glowe-muted uppercase font-semibold">
                  Maquillaje & Cabello
                </span>
              </div>
            </button>

            {/* Navigation Pills (Escritorio grande xl:) */}
            <nav
              aria-label="Navegación principal"
              className={`hidden xl:block ${
                isAuthenticated ? 'absolute left-1/2 -translate-x-1/2' : 'relative'
              }`}
            >
              <PillGroup
                options={navPills}
                activeValue={pathname}
                onChange={(to) => navigate(to)}
                ariaLabel="Secciones principales"
                containerClassName="bg-white/50 p-1.5 rounded-full border border-white/80 shadow-inner"
              />  
            </nav>

            {/* Quick Actions & Auth */}
            <div className="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-2 lg:gap-3">
              {/* Buscador: Oculto en móvil (< md), visible en tablet y PC (md:flex) */}
              <div className="hidden md:flex items-center">
                <Button
                  variant="plain"
                  size="icon"
                  onClick={() => setSearchOpen(true)}
                  className="shrink-0 text-glowe-dark hover:bg-white/80"
                  title="Buscar productos"
                  aria-label="Buscar productos"
                >
                  <Search className="w-5 h-5" />
                </Button>
              </div>

              {/* Favoritos */}
              <Button
                variant="plain"
                size="icon"
                onClick={() => navigate('/favoritos')}
                className="relative shrink-0 text-glowe-dark hover:bg-white/80 inline-flex"
                title="Tus Favoritos"
                aria-label="Ir a favoritos"
              >
                <Heart className="w-5 h-5 text-glowe-pink-accent" fill="currentColor" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-glowe-pink-accent px-1 text-[10px] font-bold text-white transition-all duration-200 animate-pulse">
                    {favoritesCount}
                  </span>
                )}
              </Button>

              {/* Carrito */}
              <Button
                variant="plain"
                size="icon"
                onClick={toggleCart}
                className="relative shrink-0 text-glowe-dark hover:bg-white/80"
                title="Abrir carrito"
                aria-label="Abrir carrito"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-glowe-dark px-1 text-[10px] font-bold text-white transition-all duration-200">
                    {itemCount}
                  </span>
                )}
              </Button>

              {/* Separador sutil */}
              <span className="hidden sm:inline-block h-6 w-px bg-glowe-pink/30 mx-0.5" aria-hidden="true" />

              {/* Zona de Autenticación / Perfil */}
              <div className="bg-white/50 p-1 rounded-full border border-white/80 shadow-inner flex items-center">
                {isAuthenticated ? (
                  <UserMenuDropdown />
                ) : (
                  /* Usuario Invitado (No Autenticado) */
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    {/* Móvil (< md): Botón compacto 'Ingresar' */}
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => navigate(`${ROUTES.AUTH}?mode=login`)}
                      className="md:hidden text-xs px-2.5 py-1.5 min-h-8 font-semibold text-glowe-dark border-transparent hover:bg-white/80"
                      title="Iniciar sesión"
                      aria-label="Iniciar sesión"
                    >
                      Ingresar
                    </Button>

                    {/* Tablet y PC (>= md): Botón secundario 'Iniciar sesión' */}
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => navigate(`${ROUTES.AUTH}?mode=login`)}
                      className="hidden md:inline-flex text-xs px-3 py-1.5 font-bold text-glowe-dark border-transparent hover:bg-white/80"
                    >
                      Iniciar sesión
                    </Button>

                    {/* Tablet y PC (>= md): Botón primario 'Registrarse' */}
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`${ROUTES.AUTH}?mode=register`)}
                      className="hidden md:inline-flex text-xs px-3.5 py-1.5 font-bold shadow-sm"
                    >
                      Registrarse
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        products={products}
        onGoToDiscover={() => navigate('/descubrir')}
      />
    </>
  )
}
