import {
  CreditCard,
  Gift,
  Inbox,
  Layers,
  LayoutDashboard,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Users,
  Zap,
} from 'lucide-react'
import GloweeLogo from './GloweeLogo'

const iconMap = {
  LayoutDashboard,
  Inbox,
  Layers,
  Tag,
  Package,
  Gift,
  Zap,
  ShoppingBag,
  CreditCard,
  Users,
  ShieldCheck,
  Settings,
}

export default function AdminSidebar({
  mobileMenuOpen,
  onCloseMobileMenu,
  activeModule,
  onSelectModule,
  navItems = [],
  adminData,
  user,
}) {
  const getBadgeValue = (id) => {
    switch (id) {
      case 'dashboard':
        return '•'
      case 'incomingOrders':
        return adminData.purchases.filter((p) => (p.status || 'Pendiente') === 'Pendiente').length
      case 'categories':
        return adminData.categories.length
      case 'tags':
        return adminData.tags.length
      case 'products':
        return adminData.products.length
      case 'bundles':
        return adminData.bundles?.length ?? 0
      case 'offers':
        return adminData.products.filter((p) => p.isOffer).length
      case 'orders':
        return adminData.purchases.filter((p) => (p.status || '') !== 'Pendiente').length
      case 'payments':
        return adminData.payments.length
      case 'roles':
        return 4
      case 'siteConfig':
        return null
      default:
        return adminData.users.length
    }
  }

  return (
    <aside
      className={`flex w-full flex-col border-b border-white/60 bg-white/65 p-4 backdrop-blur-xl xl:w-[260px] xl:border-b-0 xl:border-r ${
        mobileMenuOpen ? 'block' : 'hidden xl:block'
      }`}
    >
      <div className="flex items-center justify-between gap-3 pb-6">
        <div className="flex items-center gap-3">
          <GloweeLogo />
          <div>
            <p className="font-serif text-xl font-bold tracking-tight text-glowe-dark">Glowee</p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-glowe-muted">beauty</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCloseMobileMenu}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/60 text-sm text-glowe-dark xl:hidden"
          aria-label="Cerrar menú"
        >
          ✕
        </button>
      </div>

      <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.24em] text-glowe-muted">
        Menú principal
      </p>
      <nav className="space-y-1.5">
        {navItems.map((item) => {
          const IconComponent = iconMap[item.iconName] || LayoutDashboard
          const badgeValue = getBadgeValue(item.id)

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectModule(item.id)}
              className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition-all ${
                activeModule === item.id
                  ? 'bg-gradient-to-r from-glowe-pink/20 to-glowe-blue/15 text-glowe-dark shadow-xs ring-1 ring-white/70'
                  : 'text-glowe-muted hover:bg-white/60 hover:text-glowe-dark'
              }`}
            >
              <span className="flex items-center gap-3">
                <IconComponent className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </span>
              {badgeValue !== null && (
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-glowe-pink-accent">
                  {badgeValue}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto pt-6">
        <div className="flex items-center justify-between rounded-[1.5rem] border border-white/80 bg-white/60 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-glowe-pink to-glowe-blue text-xs font-black text-white">
              {(user?.name || 'MG').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-glowe-dark">{user?.name}</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-glowe-muted">Admin principal</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
