import { useLocation, useNavigate } from 'react-router-dom'

const menuItems = [
  { to: '/maquillaje', label: 'Maquillaje', icon: 'M5 5h14v14H5z M15 9a3 3 0 11-6 0 3 3 0 016 0 M9 15a3 3 0 016 0' },
  { to: '/cabello', label: 'Cabello', icon: 'M12 2a7 7 0 017 7c0 2-1 3-1 5a3 3 0 01-3 3h-6a3 3 0 01-3-3c0-2-1-3-1-5a7 7 0 017-7z M10 17v3m4-3v3' },
  { to: '/ofertas', label: 'Ofertas', icon: 'M12 3v18m-8-8l8 8 8-8 M5 8l3-3m8-2l3 3' },
  { to: '/combos', label: 'Combos', icon: 'M4 10l8-6 8 6v10H4z M9 15a3 3 0 016 0' },
  { to: '/descubrir', label: 'Descubrir', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
]

export default function MobileBottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border border-white/80 bg-white/90 px-2 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-glass-hover backdrop-blur-md xl:hidden sm:bottom-3 sm:left-3 sm:right-3 sm:rounded-3xl sm:pb-2.5"
      aria-label="Navegación móvil"
    >
      {menuItems.map((item) => {
        const active = pathname === item.to
        return (
          <button
            key={item.to}
            type="button"
            onClick={() => navigate(item.to)}
            className={`relative flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 transition-all duration-300 ${
              active
                ? 'bg-glowe-pink/70 text-glowe-pink-accent scale-105'
                : 'text-glowe-muted hover:text-glowe-dark'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
            </svg>
            <span className={`text-[9px] font-semibold ${active ? 'font-bold' : ''}`}>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
