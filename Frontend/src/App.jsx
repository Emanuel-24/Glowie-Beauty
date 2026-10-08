import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { getProducts } from './services/api'

import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import MobileBottomNav from './components/layout/MobileBottomNav'
import CartDrawer from './components/ui/CartDrawer'

import Inicio from './pages/Inicio'
import Maquillaje from './pages/Maquillaje'
import Cabello from './pages/Cabello'
import Ofertas from './pages/Ofertas'
import Combos from './pages/Combos'
import ComboDetalle from './pages/ComboDetalle'
import Descubrir from './pages/Descubrir'
import Producto from './pages/Producto'
import Checkout from './pages/Checkout'
import NotFound from './pages/NotFound'
import Auth from './pages/Auth'
import Perfil from './pages/Perfil'
import Favoritos from './pages/Favoritos'
import Admin from './pages/Admin'
import ProtectedRoute from './components/ProtectedRoute'

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

function AppLayout() {
  const [products, setProducts] = useState([])
  const { pathname } = useLocation()
  const isAdminArea = pathname.startsWith('/admin')

  useEffect(() => {
    getProducts().then(setProducts).catch(console.error)
  }, [])

  return (
    <div className="relative min-h-screen bg-glowe-offwhite text-glowe-dark font-sans antialiased selection:bg-glowe-pink selection:text-glowe-dark">
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-glowe-pink-accent focus:px-5 focus:py-2.5 focus:text-xs focus:font-bold focus:text-white"
      >
        Saltar al contenido principal
      </a>
      {!isAdminArea && <GlowBackground />}
      {!isAdminArea && <Header products={products} />}

      <main id="contenido-principal" className={`relative ${isAdminArea ? '' : 'pb-0 xl:pb-0'}`}>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/maquillaje" element={<Maquillaje />} />
          <Route path="/cabello" element={<Cabello />} />
          <Route path="/ofertas" element={<Ofertas />} />
          <Route path="/combos" element={<Combos />} />
          <Route path="/combos/:id" element={<ComboDetalle />} />
          <Route path="/descubrir" element={<Descubrir />} />
          <Route path="/producto/:id" element={<Producto />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Auth />} />
          <Route path="/registro" element={<Auth />} />
          <Route path="/favoritos" element={<Favoritos />} />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!isAdminArea && <Footer />}
      {!isAdminArea && <MobileBottomNav />}
      {!isAdminArea && <CartDrawer />}
    </div>
  )
}

export default function App() {
  return (
    <CartProvider>
      <FavoritesProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <ScrollToTop />
              <AppLayout />
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </FavoritesProvider>
    </CartProvider>
  )
}
