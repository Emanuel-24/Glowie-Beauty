import { useState } from 'react'
import { Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { createOrder } from '../services/orderService'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'
import { usePageMeta } from '@/hooks'

const formatCOP = (value) => `$${Number(value).toLocaleString('es-CO')}`

const paymentMethods = [
  {
    id: 'efectivo',
    label: 'Efectivo contra entrega',
    desc: 'Paga al recibir tu pedido.',
  },
  {
    id: 'tarjeta',
    label: 'Tarjeta débito / crédito',
    desc: 'Visa, Mastercard y American Express.',
  },
  {
    id: 'nequi',
    label: 'Nequi / Daviplata',
    desc: 'Paga desde tu billetera digital.',
  },
]

const emptyForm = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  department: '',
}

const generateOrderId = () =>
  `GLOWE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

export default function Checkout() {
  const { items, subtotal, shippingCost, total, clearCart } = useCart()
  const { showToast } = useToast()
  const { user, addOrder } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(() =>
    user
      ? {
          ...emptyForm,
          fullName: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
        }
      : emptyForm,
  )
  const [payment, setPayment] = useState('efectivo')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)

  usePageMeta({
    title: 'Finalizar Compra',
    description: 'Completa tus datos para confirmar tu pedido en GLOWE BEAUTY.',
    noindex: true,
  })

  const setField = (event) =>
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      const orderId = generateOrderId()
      const customerName = form.fullName.trim() || 'cliente'
      const orderPayload = {
        orderId,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          qty: item.qty,
        })),
        subtotal,
        shippingCost,
        total,
        customer: {
          fullName: customerName,
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          department: form.department.trim(),
        },
        paymentMethod: payment,
        userId: user?.id ?? null,
      }
      await createOrder(orderPayload)

      const orderBrief = {
        id: orderId,
        createdAt: new Date().toISOString(),
        total,
        status: 'Confirmado',
        items: items.map((item) => `${item.qty}x ${item.name}`),
        customer: customerName,
      }

      addOrder(orderBrief)
      clearCart()
      setSuccess({ id: orderId, customerName })
    } catch {
      showToast('No pudimos procesar tu pedido', 'Revisa tus datos e inténtalo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-10">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
            <Check className="w-7 h-7 text-emerald-600" aria-hidden="true" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-glowe-dark">¡Pedido confirmado!</h1>
          <p className="text-sm text-glowe-muted">
            Gracias, {success.customerName}. Tu orden{' '}
            <span className="font-bold text-glowe-dark">{success.id}</span> fue registrada con
            éxito. Te contactaremos para coordinar la entrega.
          </p>
          <Button fullWidth onClick={() => navigate('/')}>
            Volver al inicio
          </Button>
        </Card>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-10">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <h1 className="font-serif text-2xl font-bold text-glowe-dark">Tu carrito está vacío</h1>
          <p className="text-sm text-glowe-muted">Agrega productos antes de finalizar tu compra.</p>
          <Button variant="glass" fullWidth onClick={() => navigate('/descubrir')}>
            Explorar el catálogo
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-glowe-dark">Checkout</h1>
          <p className="text-sm text-glowe-muted">Completa tus datos y confirma tu pedido.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">
          <form className="lg:col-span-3 space-y-6" onSubmit={handleSubmit}>
            <Card className="space-y-5 p-4 sm:p-6">
              <h2 className="font-bold text-glowe-dark">Dirección de envío</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-xs font-bold text-glowe-muted mb-1.5">
                    Nombre completo
                  </label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Tu nombre completo"
                    value={form.fullName}
                    onChange={setField}
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-xs font-bold text-glowe-muted mb-1.5">
                      Correo electrónico
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="tucorreo@ejemplo.com"
                      value={form.email}
                      onChange={setField}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-xs font-bold text-glowe-muted mb-1.5">
                      Teléfono
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      placeholder="300 000 0000"
                      value={form.phone}
                      onChange={setField}
                      className="w-full"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="address" className="block text-xs font-bold text-glowe-muted mb-1.5">
                    Dirección
                  </label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    required
                    autoComplete="street-address"
                    placeholder="Calle, número y detalles"
                    value={form.address}
                    onChange={setField}
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-xs font-bold text-glowe-muted mb-1.5">
                      Ciudad
                    </label>
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      required
                      autoComplete="address-level2"
                      placeholder="Ciudad"
                      value={form.city}
                      onChange={setField}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="department" className="block text-xs font-bold text-glowe-muted mb-1.5">
                      Departamento
                    </label>
                    <Input
                      id="department"
                      name="department"
                      type="text"
                      required
                      autoComplete="address-level1"
                      placeholder="Departamento"
                      value={form.department}
                      onChange={setField}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="space-y-4 p-4 sm:p-6">
              <h2 className="font-bold text-glowe-dark">Método de pago</h2>
              <fieldset className="space-y-3">
                <legend className="sr-only">Elije tu método de pago</legend>
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-colors ${
                      payment === method.id
                        ? 'border-glowe-pink-accent bg-glowe-pink/40'
                        : 'border-white/60 bg-white/40 hover:bg-white/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={payment === method.id}
                      onChange={() => setPayment(method.id)}
                      className="mt-0.5 accent-glowe-pink-accent"
                    />
                    <span>
                      <span className="block text-xs font-bold text-glowe-dark">{method.label}</span>
                      <span className="block text-[11px] text-glowe-muted">{method.desc}</span>
                    </span>
                  </label>
                ))}
              </fieldset>
              <Button type="submit" variant="gradient" fullWidth loading={submitting} disabled={submitting}>
                Confirmar pedido
              </Button>
            </Card>
          </form>

          <aside className="lg:col-span-2" aria-label="Resumen del pedido">
            <Card className="space-y-4 p-4 sm:p-6 lg:sticky lg:top-28">
              <h2 className="font-bold text-glowe-dark">Resumen del pedido</h2>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" loading="lazy" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-glowe-dark truncate">{item.name}</h3>
                      <span className="text-[11px] text-glowe-muted">Cantidad: {item.qty}</span>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-glowe-dark whitespace-nowrap">
                      {formatCOP(item.price * item.qty)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-glowe-pink/40 pt-3 space-y-1.5 text-sm">
                <div className="flex items-center justify-between text-glowe-muted">
                  <span>Subtotal</span>
                  <span className="font-semibold text-glowe-dark">{formatCOP(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-glowe-muted">
                  <span>Envío</span>
                  {shippingCost === 0 ? (
                    <span className="font-bold text-emerald-600">Gratis</span>
                  ) : (
                    <span className="font-semibold text-glowe-dark">{formatCOP(shippingCost)}</span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3 pt-1 font-bold text-glowe-dark">
                  <span>Total</span>
                  <span>{formatCOP(total)} COP</span>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}
