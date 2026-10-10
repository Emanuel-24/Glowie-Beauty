import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { useToast } from '@/shared/toast'
import Button from '@/shared/components/ui/Button'
import Input from '@/shared/components/ui/Input'
import Card from '@/shared/components/ui/Card'
import { usePageMeta } from '@/shared/hooks/usePageMeta'

const formatCOP = (value) => `$${Number(value).toLocaleString('es-CO')}`

const formatOrderDate = (value) => {
  if (!value) return 'Reciente'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function ProfilePage() {
  usePageMeta({
    title: 'Mi Perfil',
    description: 'Gestiona tu perfil y pedidos en GLOWE BEAUTY.',
    noindex: true,
  })
  const { user, logout, orders } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const userOrders = Array.isArray(orders) ? orders : []

  const [tab, setTab] = useState('datos')

  const handleLogout = () => {
    logout()
    showToast('Sesión cerrada', '¡Vuelve pronto a Glowe!')
    navigate('/', { replace: true })
  }

  return (
    <div className="relative mx-auto max-w-2xl px-4 sm:px-6 py-8 space-y-6">
      <header className="space-y-1.5">
        <h1 className="font-serif text-2xl font-bold text-glowe-dark">Mi perfil</h1>
        <p className="text-sm text-glowe-muted">
          Hola, <span className="font-bold text-glowe-dark">{user?.name}</span>. Gestiona tus datos y tus pedidos.
        </p>
      </header>

      <div role="tablist" aria-label="Secciones del perfil" className="flex gap-2 rounded-full bg-white/40 p-1">
        <button
          role="tab"
          aria-selected={tab === 'datos'}
          aria-controls="panel-datos"
          onClick={() => setTab('datos')}
          className={`min-h-10 flex-1 rounded-full px-3 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glowe-pink sm:px-4 ${
            tab === 'datos' ? 'bg-glowe-pink text-glowe-dark shadow-sm' : 'text-glowe-muted hover:text-glowe-dark'
          }`}
        >
          Mis datos
        </button>
        <button
          role="tab"
          aria-selected={tab === 'pedidos'}
          aria-controls="panel-pedidos"
          onClick={() => setTab('pedidos')}
          className={`min-h-10 flex-1 rounded-full px-3 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glowe-pink sm:px-4 ${
            tab === 'pedidos' ? 'bg-glowe-pink text-glowe-dark shadow-sm' : 'text-glowe-muted hover:text-glowe-dark'
          }`}
        >
          Historial de pedidos
        </button>
      </div>

      {tab === 'datos' ? (
        <Card className="p-6 space-y-4">
          <h2 className="font-bold text-glowe-dark">Mis datos</h2>
          <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
            <div>
              <label htmlFor="perfil-name" className="block text-xs font-bold text-glowe-muted mb-1.5">
                Nombre completo
              </label>
              <Input
                id="perfil-name"
                name="name"
                defaultValue={user?.name || ''}
                autoComplete="name"
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="perfil-email" className="block text-xs font-bold text-glowe-muted mb-1.5">
                Correo electrónico
              </label>
              <Input
                id="perfil-email"
                name="email"
                type="email"
                readOnly
                defaultValue={user?.email || ''}
                autoComplete="email"
                className="w-full opacity-70"
              />
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button type="submit" variant="gradient">
                Guardar cambios
              </Button>
              <Button variant="plain" className="text-rose-600" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="p-6 space-y-4">
          <h2 className="font-bold text-glowe-dark">Historial de pedidos</h2>
          {userOrders.length === 0 ? (
            <p className="text-sm text-glowe-muted">Aún no tienes pedidos. ¡Tu primer glow te espera!</p>
          ) : (
            <ul className="space-y-3">
              {userOrders.map((order) => {
                const orderItems = Array.isArray(order.items) ? order.items : []
                return (
                  <li key={order.id} className="rounded-2xl border border-white/60 bg-white/40 p-4 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-glowe-dark">Pedido {order.id}</p>
                        <p className="text-[11px] text-glowe-muted">Realizado el {formatOrderDate(order.createdAt ?? order.date)}</p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                        {order.status}
                      </span>
                    </div>
                    <ul className="space-y-0.5 text-xs text-glowe-muted">
                      {orderItems.map((item, index) => (
                        <li key={`${order.id}-${index}`}>• {typeof item === 'string' ? item : item.name}</li>
                      ))}
                    </ul>
                    <p className="text-sm font-bold text-glowe-dark">
                      Total: {formatCOP(order.total)}
                      <span className="ml-1 font-sans text-[10px] text-glowe-muted font-medium">COP</span>
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      )}
    </div>
  )
}
