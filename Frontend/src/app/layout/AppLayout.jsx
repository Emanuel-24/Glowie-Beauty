import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import MobileBottomNav from './MobileBottomNav'
import { CartDrawer } from '@/features/cart'

function GlowBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute bg-glowe-pink w-96 h-96 rounded-full blur-[70px] opacity-65 -top-20 -left-20" />
      <div className="absolute bg-glowe-yellow w-96 h-96 rounded-full blur-[70px] opacity-65 top-1/3 -right-20" />
      <div className="absolute bg-glowe-blue w-96 h-96 rounded-full blur-[70px] opacity-65 top-2/3 -left-32" />
      <div className="absolute bg-glowe-pink w-80 h-80 rounded-full blur-[70px] opacity-65 bottom-0 -right-10" />
    </div>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

export default function AppLayout() {
  const { pathname } = useLocation()
  const isAdminArea = pathname.startsWith('/admin')

  return (
    <div className="relative min-h-screen bg-glowe-offwhite text-glowe-dark font-sans antialiased selection:bg-glowe-pink selection:text-glowe-dark">
      <ScrollToTop />
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-glowe-pink-accent focus:px-5 focus:py-2.5 focus:text-xs focus:font-bold focus:text-white"
      >
        Saltar al contenido principal
      </a>

      {!isAdminArea && <GlowBackground />}
      {!isAdminArea && <Header />}

      <main id="contenido-principal" className={`relative ${isAdminArea ? '' : 'pb-0 xl:pb-0'}`}>
        <Outlet />
      </main>

      {!isAdminArea && <Footer />}
      {!isAdminArea && <MobileBottomNav />}
      {!isAdminArea && <CartDrawer />}
    </div>
  )
}
