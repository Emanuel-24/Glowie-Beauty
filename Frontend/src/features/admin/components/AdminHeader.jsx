import { UserMenuDropdown } from '@/features/auth'

export default function AdminHeader({
  moduleTitle = '',
  onOpenMobileMenu,
  onLogout,
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-white/60 bg-white/35 px-4 py-4 backdrop-blur-sm md:px-6 xl:flex-row xl:items-center xl:justify-between">
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

        <div className="min-w-0 truncate text-xs font-semibold uppercase tracking-[0.16em] text-glowe-muted sm:tracking-[0.22em]">
          Workspace <span className="text-glowe-pink-accent">/</span> {moduleTitle}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Notificaciones */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/70 text-base text-glowe-dark shadow-xs backdrop-blur-md transition hover:bg-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glowe-pink-accent"
          aria-label="Notificaciones"
        >
          🔔
        </button>

        {/* Menú de Usuario Reutilizable */}
        <UserMenuDropdown onLogoutSuccess={onLogout} showStoreLink={true} />
      </div>
    </header>
  )
}
