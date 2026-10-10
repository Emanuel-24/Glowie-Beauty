export default function AdminHeader({
  moduleTitle = '',
  onOpenMobileMenu,
  user,
  showAccountMenu,
  setShowAccountMenu,
  onLogout,
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-white/60 bg-white/35 px-4 py-4 backdrop-blur-sm md:px-6 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/70 text-glowe-dark xl:hidden"
          aria-label="Abrir menú"
        >
          ☰
        </button>
        <div className="min-w-0 truncate text-xs font-semibold uppercase tracking-[0.16em] text-glowe-muted sm:tracking-[0.22em]">
          Workspace <span className="text-glowe-pink-accent">/</span> {moduleTitle}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button
          type="button"
          className="rounded-full border border-white/80 bg-white/70 p-2.5 text-base text-glowe-dark shadow-sm"
          aria-label="Notificaciones"
        >
          🔔
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAccountMenu((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-glowe-pink to-glowe-blue text-xs font-black text-white shadow-sm transition hover:scale-[1.02]"
            aria-label="Abrir menú de cuenta"
          >
            {(user?.name || 'MG').slice(0, 2).toUpperCase()}
          </button>

          {showAccountMenu && (
            <div className="absolute right-0 z-20 mt-3 w-52 overflow-hidden rounded-[1.25rem] border border-white/80 bg-white/95 p-2 shadow-[0_20px_40px_rgba(50,34,60,0.15)] backdrop-blur-xl">
              <div className="px-3 py-2">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-glowe-muted">Cuenta</p>
                <p className="mt-1 text-sm font-semibold text-glowe-dark">{user?.name}</p>
                <p className="text-xs text-glowe-muted">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAccountMenu(false)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium text-glowe-dark transition hover:bg-pink-50"
              >
                <span>Perfil</span>
                <span aria-hidden="true">→</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAccountMenu(false)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium text-glowe-dark transition hover:bg-sky-50"
              >
                <span>Configuración</span>
                <span aria-hidden="true">⚙</span>
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                <span>Cerrar sesión</span>
                <span aria-hidden="true">↗</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
