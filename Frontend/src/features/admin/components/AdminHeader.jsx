import Button from '@/shared/components/ui/Button'
import { UserMenuDropdown } from '@/features/auth'
import NotificationDropdown from './NotificationDropdown'

export default function AdminHeader({
  activeModule = 'dashboard',
  moduleTitle = '',
  onOpenMobileMenu,
  onLogout,
  user,
  onExport,
  timeFilter = null,
  pendingOrders = [],
  onSelectOrder,
  onNavigateToOrders,
}) {
  const isDashboard = activeModule === 'dashboard'
  const todayLabel = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  const todayLabelCap = todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1)

  return (
    <header className="relative z-30 flex flex-col gap-4 border-b border-white/60 bg-white/35 px-4 py-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between md:px-6">
      <div className="flex items-center gap-3">
        {/* Botón menú móvil (xl:hidden) */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/70 text-glowe-dark shadow-xs backdrop-blur-md transition hover:bg-white xl:hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glowe-pink-accent"
          aria-label="Abrir menú"
        >
          ☰
        </button>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-glowe-pink-accent">
            {isDashboard ? todayLabelCap : 'Panel de Administración'}
          </p>
          <h1 className="mt-1 font-serif text-2xl font-bold text-glowe-dark md:text-3xl">
            {isDashboard ? (
              <>
                Buenos días, {user?.name?.split(' ')[0] || 'María'} <span aria-hidden="true">✦</span>
              </>
            ) : (
              moduleTitle
            )}
          </h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 md:gap-3">
        {timeFilter}

        {onExport && (
          <Button
            variant="glass"
            className="h-10 rounded-full px-4 text-xs font-semibold shadow-sm sm:h-11 sm:px-5 sm:text-sm"
            onClick={onExport}
          >
            Exportar reporte
          </Button>
        )}

        {/* Notificaciones de pedidos pendientes */}
        <NotificationDropdown
          pendingOrders={pendingOrders}
          onSelectOrder={onSelectOrder}
          onNavigateToOrders={onNavigateToOrders}
        />

        {/* Menú de Usuario Reutilizable */}
        <UserMenuDropdown onLogoutSuccess={onLogout} showStoreLink={true} />
      </div>
    </header>
  )
}
