import { useLocation, useNavigate } from 'react-router-dom'
import { Sparkles, Scissors, BadgeDollarSign, Package, Search } from 'lucide-react'

const menuItems = [
  { to: '/maquillaje', label: 'Maquillaje', Icon: Sparkles },
  { to: '/cabello', label: 'Cabello', Icon: Scissors },
  { to: '/ofertas', label: 'Ofertas', Icon: BadgeDollarSign },
  { to: '/combos', label: 'Combos', Icon: Package },
  { to: '/descubrir', label: 'Descubrir', Icon: Search },
]

export default function MobileBottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav
      className="fixed bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-6 mx-auto max-w-md z-50 flex items-center justify-between rounded-full border border-white/80 bg-white/70 px-2 py-1.5 shadow-[0_12px_40px_rgba(101,73,107,0.22)] backdrop-blur-xl xl:hidden"
      aria-label="Navegación móvil"
    >
      {menuItems.map((item) => {
        const active = pathname === item.to
        const IconComponent = item.Icon
        return (
          <button
            key={item.to}
            type="button"
            onClick={() => navigate(item.to)}
            className={`relative flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-1 transition-all duration-300 cursor-pointer ${
              active
                ? 'bg-glowe-pink/60 text-glowe-pink-accent scale-105 shadow-xs font-bold'
                : 'text-glowe-muted hover:text-glowe-dark hover:bg-white/50'
            }`}
          >
            <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            <span className={`text-[9px] sm:text-[10px] leading-tight ${active ? 'font-bold' : 'font-medium'}`}>
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
