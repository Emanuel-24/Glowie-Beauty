import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Orbit } from '@uiball/loaders'
import { useAuth } from '@/features/auth'
import { navItems } from '@/features/admin/constants'
import { useAdminData } from '@/features/admin/hooks/useAdminData'
import AdminSidebar from '@/features/admin/components/AdminSidebar'
import AdminHeader from '@/features/admin/components/AdminHeader'
import DashboardTab from '@/features/admin/tabs/dashboard/DashboardTab'
import SiteConfigTab from '@/features/admin/tabs/site-config/SiteConfigTab'
import CategoriesTab from '@/features/admin/tabs/categories/CategoriesTab'
import TagsTab from '@/features/admin/tabs/tags/TagsTab'
import UsersTab from '@/features/admin/tabs/users/UsersTab'
import PaymentsTab from '@/features/admin/tabs/payments/PaymentsTab'
import ProductsTab from '@/features/admin/tabs/products/ProductsTab'
import OrdersTab from '@/features/admin/tabs/orders/OrdersTab'
import OffersTab from '@/features/admin/tabs/offers/OffersTab'

gsap.registerPlugin(ScrollTrigger)

const moduleTitles = {
  dashboard: 'Dashboard',
  categories: 'Categoría de productos',
  tags: 'Etiquetas / Tags',
  products: 'Productos',
  siteConfig: 'Configuración Web',
  orders: 'Compras',
  payments: 'Pagos y abonos',
  users: 'Usuarios',
  offers: 'Ofertas y Descuentos',
}

export default function AdminPage() {
  const navigate = useNavigate()
  const panelRef = useRef(null)
  const { user, logout } = useAuth()
  const [activeModule, setActiveModule] = useState('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)

  const adminData = useAdminData()

  useEffect(() => {
    if (!panelRef.current || !adminData.moduleReady) return undefined
    const ctx = gsap.context(() => {
      gsap.from('.admin-module-card', {
        y: 18,
        opacity: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: panelRef.current, start: 'top 85%' },
      })
    }, panelRef)
    return () => ctx.revert()
  }, [adminData.moduleReady, activeModule])

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
        <div className="max-w-md rounded-[2rem] border border-white/70 bg-white/70 p-8 text-center shadow-[0_20px_60px_rgba(104,80,111,0.12)] backdrop-blur-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-glowe-pink-accent">Acceso</p>
          <h1 className="mt-3 font-serif text-2xl font-bold text-glowe-dark">Acceso restringido</h1>
          <p className="mt-3 text-sm text-glowe-muted">Esta vista solo está disponible para administradores.</p>
        </div>
      </div>
    )
  }

  const renderModuleContent = () => {
    if (!adminData.moduleReady) {
      return (
        <div className="flex min-h-[420px] items-center justify-center">
          <div className="flex flex-col items-center gap-3 rounded-[2rem] border border-white/70 bg-white/70 px-8 py-6 shadow-xl backdrop-blur-md">
            <Orbit size={34} color="#ff758f" speed={1.4} />
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-glowe-muted">Cargando panel</span>
          </div>
        </div>
      )
    }

    switch (activeModule) {
      case 'dashboard':
        return (
          <DashboardTab
            user={user}
            summary={adminData.summary}
            last7Days={adminData.last7Days}
            purchases={adminData.purchases}
            onExport={adminData.exportDashboard}
            onViewAllOrders={() => setActiveModule('orders')}
          />
        )
      case 'siteConfig':
        return <SiteConfigTab siteConfigData={adminData.siteConfigData} setSiteConfigData={adminData.setSiteConfigData} products={adminData.products} />
      case 'categories':
        return <CategoriesTab categories={adminData.categories} setCategories={adminData.setCategories} searchValue={adminData.searches.categories} onSearchChange={(v) => adminData.handleSearchChange('categories', v)} />
      case 'tags':
        return <TagsTab tags={adminData.tags} setTags={adminData.setTags} searchValue={adminData.searches.tags} onSearchChange={(v) => adminData.handleSearchChange('tags', v)} />
      case 'users':
        return <UsersTab users={adminData.users} setUsers={adminData.setUsers} searchValue={adminData.searches.users} onSearchChange={(v) => adminData.handleSearchChange('users', v)} />
      case 'payments':
        return <PaymentsTab payments={adminData.payments} setPayments={adminData.setPayments} purchases={adminData.purchases} searchValue={adminData.searches.payments} onSearchChange={(v) => adminData.handleSearchChange('payments', v)} />
      case 'products':
        return <ProductsTab products={adminData.products} setProducts={adminData.setProducts} tags={adminData.tags} searchValue={adminData.searches.products} onSearchChange={(v) => adminData.handleSearchChange('products', v)} onConfigureOffer={() => setActiveModule('offers')} />
      case 'orders':
        return <OrdersTab purchases={adminData.purchases} setPurchases={adminData.setPurchases} products={adminData.products} searchValue={adminData.searches.orders} onSearchChange={(v) => adminData.handleSearchChange('orders', v)} />
      case 'offers':
        return <OffersTab products={adminData.products} setProducts={adminData.setProducts} searchValue={adminData.searches.offers} onSearchChange={(v) => adminData.handleSearchChange('offers', v)} />
      default:
        return null
    }
  }

  return (
    <div ref={panelRef} className="relative z-10 px-3 py-4 sm:px-4 sm:py-6 md:px-8 md:py-8">
      <div className="admin-module-card mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/65 bg-white/60 shadow-[0_25px_80px_rgba(95,72,111,0.08)] backdrop-blur-xl">
        <div className="flex min-h-[860px] flex-col xl:flex-row">
          <AdminSidebar
            mobileMenuOpen={mobileMenuOpen}
            onCloseMobileMenu={() => setMobileMenuOpen(false)}
            activeModule={activeModule}
            onSelectModule={(id) => { setActiveModule(id); setMobileMenuOpen(false); }}
            navItems={navItems}
            adminData={adminData}
            user={user}
          />
          <section className="flex-1 bg-[radial-gradient(circle_at_top_left,_rgba(255,176,201,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(140,229,247,0.14),transparent_35%)]">
            <AdminHeader
              moduleTitle={moduleTitles[activeModule]}
              onOpenMobileMenu={() => setMobileMenuOpen(true)}
              user={user}
              showAccountMenu={showAccountMenu}
              setShowAccountMenu={setShowAccountMenu}
              onLogout={() => { logout(); navigate('/login', { replace: true }); }}
            />
            <div className="space-y-6 px-4 py-6 md:px-6 md:py-8">{renderModuleContent()}</div>
          </section>
        </div>
      </div>
    </div>
  )
}
