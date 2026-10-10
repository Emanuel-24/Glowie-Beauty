import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { Orbit } from '@uiball/loaders'
import { ProtectedRoute } from '@/features/auth'
import AppLayout from './layout/AppLayout'
import { ROUTES } from './routes'

// Code-splitting por página (Chunks individuales bajo demanda)
const HomePage = lazy(() => import('@/features/home/pages/HomePage'))
const MakeupPage = lazy(() => import('@/features/products/pages/MakeupPage'))
const HairPage = lazy(() => import('@/features/products/pages/HairPage'))
const OffersPage = lazy(() => import('@/features/promotions/pages/OffersPage'))
const BundlesPage = lazy(() => import('@/features/promotions/pages/BundlesPage'))
const BundleDetailPage = lazy(() => import('@/features/promotions/pages/BundleDetailPage'))
const DiscoverPage = lazy(() => import('@/features/products/pages/DiscoverPage'))
const FavoritesPage = lazy(() => import('@/features/products/pages/FavoritesPage'))
const ProductPage = lazy(() => import('@/features/products/pages/ProductPage'))
const CheckoutPage = lazy(() => import('@/features/orders/pages/CheckoutPage'))
const ProfilePage = lazy(() => import('@/features/account/pages/ProfilePage'))
const AdminPage = lazy(() => import('@/features/admin/pages/AdminPage'))
const AuthPage = lazy(() => import('@/features/auth/pages/AuthPage'))
const NotFoundPage = lazy(() => import('@/features/home/pages/NotFoundPage'))

export function PageLoader() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center p-8"
      role="status"
      aria-label="Cargando página"
    >
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/70 bg-white/70 px-8 py-6 shadow-xl backdrop-blur-md">
        <Orbit size={34} color="#ff758f" speed={1.4} />
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-glowe-muted">
          Cargando contenido...
        </span>
      </div>
    </div>
  )
}

function withSuspense(Component) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: ROUTES.HOME,
        element: withSuspense(HomePage),
      },
      {
        path: ROUTES.MAKEUP,
        element: withSuspense(MakeupPage),
      },
      {
        path: ROUTES.HAIR,
        element: withSuspense(HairPage),
      },
      {
        path: ROUTES.OFFERS,
        element: withSuspense(OffersPage),
      },
      {
        path: ROUTES.BUNDLES,
        element: withSuspense(BundlesPage),
      },
      {
        path: ROUTES.BUNDLE_DETAIL_PARAM,
        element: withSuspense(BundleDetailPage),
      },
      {
        path: ROUTES.DISCOVER,
        element: withSuspense(DiscoverPage),
      },
      {
        path: ROUTES.PRODUCT_DETAIL_PARAM,
        element: withSuspense(ProductPage),
      },
      {
        path: ROUTES.CHECKOUT,
        element: (
          <ProtectedRoute>
            {withSuspense(CheckoutPage)}
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.LOGIN,
        element: withSuspense(AuthPage),
      },
      {
        path: ROUTES.AUTH,
        element: withSuspense(AuthPage),
      },
      {
        path: ROUTES.REGISTER,
        element: withSuspense(AuthPage),
      },
      {
        path: ROUTES.FAVORITES,
        element: withSuspense(FavoritesPage),
      },
      {
        path: ROUTES.PROFILE,
        element: (
          <ProtectedRoute>
            {withSuspense(ProfilePage)}
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.ADMIN,
        element: (
          <ProtectedRoute requireAdmin>
            {withSuspense(AdminPage)}
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: withSuspense(NotFoundPage),
      },
    ],
  },
])

export default router
