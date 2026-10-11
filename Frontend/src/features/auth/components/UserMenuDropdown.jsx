import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Store,
  User,
} from 'lucide-react'
import { useAuth } from '@/features/auth'
import { useToast } from '@/shared/toast'
import { ROUTES } from '@/app/routes'
import Badge from '@/shared/components/ui/Badge'

export default function UserMenuDropdown({
  align = 'right',
  onLogoutSuccess,
  showStoreLink = null, // auto-detect si no se pasa: false en tienda, true en admin
  className = '',
}) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const { showToast } = useToast()

  const isInAdmin = pathname.startsWith('/admin')
  const shouldShowStoreLink = showStoreLink !== null ? showStoreLink : isInAdmin

  // Manejo accesible de cierre: click outside y tecla Escape
  useEffect(() => {
    if (!open) return

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  if (!user) return null

  const firstName = user?.name ? user.name.trim().split(/\s+/)[0] : 'Usuario'
  const userInitial = firstName.charAt(0).toUpperCase() || 'U'
  const isAdmin = user?.role === 'admin'

  const handleLogout = () => {
    setOpen(false)
    logout()
    if (onLogoutSuccess) {
      onLogoutSuccess()
    } else {
      showToast('Sesión cerrada', 'Has cerrado sesión con éxito. ¡Vuelve pronto!', '👋')
      if (isInAdmin) {
        navigate(ROUTES.HOME, { replace: true })
      }
    }
  }

  const alignmentClass = align === 'left' ? 'left-0' : 'right-0'

  return (
    <div className={`relative shrink-0 ${className}`} ref={menuRef}>
      {/* Botón Píldora para Tablet / PC (>= md) */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Menú de usuario: ${firstName}`}
        className="hidden md:inline-flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-transparent hover:bg-white/60 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glowe-pink-accent cursor-pointer group"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-glowe-pink via-glowe-pink-dark to-glowe-pink-accent text-white font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
          {userInitial}
        </div>
        <span className="text-xs font-bold text-glowe-dark max-w-[100px] lg:max-w-[130px] truncate">
          {firstName}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-glowe-muted transition-transform duration-200 ${
            open ? 'rotate-180 text-glowe-pink-accent' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Botón Circular Compacto para Móvil (< md) */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Menú de usuario: ${firstName}`}
        className="md:hidden flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-glowe-pink via-glowe-pink-dark to-glowe-pink-accent text-white font-bold text-xs shadow-sm border border-white hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glowe-pink-accent cursor-pointer transition-transform active:scale-95"
      >
        {userInitial}
      </button>

      {/* Dropdown Menu Accesible */}
      {open && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={`absolute ${alignmentClass} mt-2 w-56 rounded-2xl bg-white border border-glowe-pink/30 shadow-[0_12px_36px_rgba(101,73,107,0.18)] py-2 z-50 animate-[fadeIn_.15s_ease-out]`}
        >
          {/* Header del dropdown con datos del usuario */}
          <div className="px-4 py-2.5 border-b border-glowe-pink/20">
            <p className="text-xs font-bold text-glowe-dark truncate">{user?.name || 'Usuario'}</p>
            <p className="text-[11px] text-glowe-muted truncate">{user?.email}</p>
            {isAdmin && (
              <div className="mt-1.5">
                <Badge tone="accent" className="text-[9px] py-0.5 px-2">
                  Administrador
                </Badge>
              </div>
            )}
          </div>

          <div className="py-1">
            {/* Enlace a Perfil y Pedidos (solo visible en la tienda/landing, oculto en el panel admin) */}
            {!isInAdmin && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false)
                  navigate(ROUTES.PROFILE)
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-glowe-dark hover:bg-glowe-blue/30 hover:text-glowe-blue-accent transition-colors text-left cursor-pointer"
              >
                <User className="h-4 w-4 text-glowe-blue-accent" aria-hidden="true" />
                <span>Mi Perfil / Mis Pedidos</span>
              </button>
            )}

            {/* Si está en el admin: opción de "Ver Tienda" */}
            {shouldShowStoreLink && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false)
                  navigate(ROUTES.HOME)
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-yellow-dark hover:bg-glowe-yellow/30 hover:text-glowe-yellow-accent transition-colors text-left cursor-pointer"
              >
                <Store className="h-4 w-4 text-glowe-yellow-accent" aria-hidden="true" />
                <span>Ver Tienda</span>
              </button>
            )}

            {/* Si está en la tienda y es admin: enlace al Panel Admin */}
            {!isInAdmin && isAdmin && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false)
                  navigate(ROUTES.ADMIN)
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-glowe-dark hover:bg-glowe-yellow/30 hover:text-glowe-yellow-accent transition-colors text-left cursor-pointer"
              >
                <LayoutDashboard className="h-4 w-4 text-glowe-yellow-accent" aria-hidden="true" />
                <span>Panel Admin</span>
              </button>
            )}
          </div>

          {/* Separador y Cerrar sesión */}
          <div className="border-t border-glowe-pink/20 pt-1 mt-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
