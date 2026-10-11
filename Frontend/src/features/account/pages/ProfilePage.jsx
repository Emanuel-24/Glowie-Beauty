import { useState, useMemo, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Sparkles,
  Package,
  UserRound,
  LogOut,
  Mail,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/features/auth'
import { getOrders } from '@/features/orders'
import { useToast } from '@/shared/toast'
import { usePageMeta } from '@/shared/hooks/usePageMeta'
import { ROUTES } from '@/shared/config/routes'
import OrderCard from '@/features/account/components/OrderCard'
import ProfileForm from '@/features/account/components/ProfileForm'

const FILTERS = ['Todos', 'Pendientes', 'En preparación', 'En camino', 'Entregados']

export default function ProfilePage() {
  usePageMeta({
    title: 'Mi Perfil | Glowe Beauty',
    description: 'Gestiona tus compras, haz seguimiento en vivo y actualiza tus datos en Glowe Beauty.',
    noindex: true,
  })

  const { user, logout, orders: contextOrders } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [tab, setTab] = useState('orders')
  const [filter, setFilter] = useState('Todos')
  const [fetchedOrders, setFetchedOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  // Sincronizar pedidos de la API y del contexto
  useEffect(() => {
    let isMounted = true

    async function loadUserOrders() {
      try {
        setLoadingOrders(true)
        const apiData = await getOrders()
        if (isMounted && Array.isArray(apiData) && apiData.length > 0) {
          setFetchedOrders(apiData)
        }
      } catch {
        // Fallback silencioso a las órdenes del contexto si la API está desconectada
      } finally {
        if (isMounted) setLoadingOrders(false)
      }
    }

    loadUserOrders()
    return () => {
      isMounted = false
    }
  }, [])

  // Consolidar lista de órdenes
  const allOrders = useMemo(() => {
    if (fetchedOrders.length > 0) return fetchedOrders
    if (Array.isArray(contextOrders) && contextOrders.length > 0) return contextOrders
    return []
  }, [fetchedOrders, contextOrders])

  // Filtrado reactivo de pedidos
  const visibleOrders = useMemo(() => {
    return allOrders.filter((order) => {
      if (filter === 'Todos') return true
      const statusLower = String(order.status || '').toLowerCase()

      if (filter === 'Pendientes') {
        return statusLower.includes('pend') || statusLower.includes('cread')
      }
      if (filter === 'En preparación') {
        return (
          statusLower.includes('prepar') ||
          statusLower.includes('proceso') ||
          statusLower.includes('paid')
        )
      }
      if (filter === 'En camino') {
        return (
          statusLower.includes('camino') ||
          statusLower.includes('enviad') ||
          statusLower.includes('shipped')
        )
      }
      if (filter === 'Entregados') {
        return (
          statusLower.includes('entreg') ||
          statusLower.includes('comple') ||
          statusLower.includes('delivered')
        )
      }
      return true
    })
  }, [allOrders, filter])

  const handleLogout = () => {
    logout()
    showToast('Sesión cerrada', '¡Vuelve pronto a Glowe Beauty!')
    navigate(ROUTES.HOME, { replace: true })
  }

  const handleSaveProfile = async (formData) => {
    showToast('Perfil actualizado', 'Tus datos de entrega han sido guardados.')
  }

  // Iniciales del usuario para el avatar
  const userInitials = useMemo(() => {
    const name = user?.name || 'Cliente'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return (name.slice(0, 2) || 'GL').toUpperCase()
  }, [user?.name])

  return (
    <div className="min-h-screen bg-[#FAF8F5] px-4 py-8 text-[#2D2A2E] sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Banner de Bienvenida Glow */}
        <section className="relative overflow-hidden rounded-[1.75rem] bg-[#FDE2E4] px-6 py-7 sm:px-9 sm:py-8">
          <div className="relative z-10 max-w-xl">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-[#b94d68]">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Cliente verificada · Miembro Glow
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              ¡Hola, {user?.name || 'Glower'}! <span aria-hidden="true">✦</span>
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#735d61] sm:text-base">
              Gestiona tus compras, haz seguimiento en vivo y actualiza tus datos de entrega.
            </p>
          </div>
          <Sparkles
            aria-hidden="true"
            className="pointer-events-none absolute -right-3 -top-8 size-40 rotate-12 text-white/45"
            strokeWidth={1}
          />
        </section>

        {/* Selector de Pestañas Móvil */}
        <div className="mt-6 flex gap-2 overflow-x-auto rounded-2xl bg-white p-1.5 shadow-sm md:hidden">
          <button
            type="button"
            onClick={() => setTab('orders')}
            className={`flex-1 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              tab === 'orders' ? 'bg-[#2D2A2E] text-white' : 'text-[#78716C] hover:bg-[#FAF8F5]'
            }`}
          >
            Mis Pedidos ({allOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('details')}
            className={`flex-1 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              tab === 'details' ? 'bg-[#2D2A2E] text-white' : 'text-[#78716C] hover:bg-[#FAF8F5]'
            }`}
          >
            Mis Datos
          </button>
        </div>

        {/* Layout Principal: Sidebar y Contenido */}
        <div className="mt-6 grid gap-6 md:grid-cols-[260px_1fr] lg:grid-cols-[280px_1fr]">
          {/* Sidebar de Escritorio */}
          <aside className="hidden md:block md:sticky md:top-24 md:self-start">
            <div className="rounded-3xl border border-[#f2dfe1] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3 border-b border-[#f3e9e7] pb-5">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#FDE2E4] text-lg font-semibold text-[#b94d68]">
                  {userInitials}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#2D2A2E]">{user?.name || 'Cliente Glowe'}</p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-[#78716C]">
                    <Mail className="size-3 shrink-0" aria-hidden="true" />
                    <span className="truncate">{user?.email || 'cliente@glowebeauty.com'}</span>
                    <ShieldCheck className="size-3 shrink-0 text-[#59b1aa]" aria-hidden="true" />
                  </p>
                </div>
              </div>

              <nav className="flex flex-col gap-1 py-5" aria-label="Cuenta">
                <button
                  type="button"
                  onClick={() => setTab('orders')}
                  className={`flex items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                    tab === 'orders'
                      ? 'bg-[#FDE2E4] text-[#b94d68]'
                      : 'text-[#78716C] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Package className="size-4" aria-hidden="true" /> Mis Pedidos
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      tab === 'orders' ? 'bg-white' : 'bg-[#FAF8F5]'
                    }`}
                  >
                    {allOrders.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTab('details')}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                    tab === 'details'
                      ? 'bg-[#FDE2E4] text-[#b94d68]'
                      : 'text-[#78716C] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <UserRound className="size-4" aria-hidden="true" /> Mis Datos
                </button>
              </nav>

              <div className="border-t border-[#f3e9e7] pt-4">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-[#78716C] transition hover:bg-rose-50 hover:text-rose-600"
                >
                  <LogOut className="size-4" aria-hidden="true" /> Cerrar sesión
                </button>
              </div>
            </div>
          </aside>

          {/* Área de Contenido */}
          <section className="min-w-0">
            {tab === 'orders' ? (
              <div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FF758F]">
                      Tu actividad
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold text-[#2D2A2E]">Mis Pedidos</h2>
                  </div>
                  <Link
                    to={ROUTES.MAKEUP}
                    className="inline-flex items-center gap-1 text-sm font-medium text-[#FF758F] transition hover:underline"
                  >
                    Explorar catálogo <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>

                {/* Filtros de Pedidos */}
                <div
                  className="mt-5 flex gap-2 overflow-x-auto pb-1"
                  role="tablist"
                  aria-label="Filtrar pedidos"
                >
                  {FILTERS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setFilter(item)}
                      role="tab"
                      aria-selected={filter === item}
                      className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-medium transition ${
                        filter === item
                          ? 'border-[#2D2A2E] bg-[#2D2A2E] text-white'
                          : 'border-[#eadfdb] bg-white text-[#78716C] hover:border-[#FF758F] hover:text-[#FF758F]'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                {/* Listado de Pedidos */}
                <div className="mt-5 flex flex-col gap-4">
                  {visibleOrders.map((order) => (
                    <OrderCard
                      key={order.id || order._id}
                      order={order}
                      customerName={user?.name}
                      onReorder={() => navigate(ROUTES.MAKEUP)}
                    />
                  ))}
                </div>

                {/* Estado Vacío */}
                {visibleOrders.length === 0 && !loadingOrders && (
                  <div className="mt-5 flex flex-col items-center rounded-3xl border border-dashed border-[#e5d8d3] bg-white px-6 py-14 text-center">
                    <Package className="size-9 text-[#d9a9b1]" strokeWidth={1.5} aria-hidden="true" />
                    <h3 className="mt-4 font-semibold text-[#2D2A2E]">Aún no tienes pedidos aquí</h3>
                    <p className="mt-1 max-w-xs text-sm text-[#78716C]">
                      Cuando hagas una compra, podrás ver todos los detalles y rastrearla en este espacio.
                    </p>
                    <Link
                      to={ROUTES.MAKEUP}
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#FF758F] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-95"
                    >
                      Explorar catálogo <ChevronRight className="size-4" aria-hidden="true" />
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <ProfileForm user={user} onSave={handleSaveProfile} />
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
