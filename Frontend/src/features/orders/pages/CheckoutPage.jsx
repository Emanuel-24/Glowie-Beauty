import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/shared/components/ui/Button'
import Input from '@/shared/components/ui/Input'
import Card from '@/shared/components/ui/Card'
import { usePageMeta } from '@/shared/hooks/usePageMeta'
import { useCheckout } from '@/features/orders/hooks/useCheckout'
import CheckoutSuccess from '@/features/orders/components/CheckoutSuccess'
import CheckoutPaymentMethodCard from '@/features/orders/components/CheckoutPaymentMethodCard'
import CheckoutSummary from '@/features/orders/components/CheckoutSummary'

const paymentMethods = [
  {
    id: 'contra_entrega',
    label: 'Efectivo / Transferencia contra entrega',
    desc: 'Paga al recibir el producto en tu domicilio.',
  },
  {
    id: 'abono',
    label: 'Abono / Crédito',
    desc: 'Separa tu orden con un abono inicial.',
    notice: 'El valor o porcentaje a abonar para separar tu orden se coordinará directamente por WhatsApp con nuestro equipo.',
  },
  {
    id: 'transferencia_completa',
    label: 'Transferencia pago completo',
    desc: 'Pago total por adelantado vía Bancolombia / Nequi / Daviplata.',
  },
]

const emptyForm = {
  fullName: '',
  cedula: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  department: '',
  notes: '',
}

export default function CheckoutPage() {
  const {
    items,
    subtotal,
    shippingCost,
    total,
    user,
    submitting,
    success,
    processOrder,
  } = useCheckout()
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
  const [payment, setPayment] = useState('contra_entrega')

  usePageMeta({
    title: 'Finalizar Compra',
    description: 'Completa tus datos para confirmar tu pedido en GLOWE BEAUTY.',
    noindex: true,
  })

  const setField = (event) =>
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await processOrder({ form, paymentMethod: payment })
    } catch {
      // Error handled in useCheckout with toast
    }
  }

  if (success) {
    return <CheckoutSuccess success={success} />
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
              <h2 className="font-bold text-glowe-dark">Datos de contacto y entrega</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullName" className="block text-xs font-bold text-glowe-muted mb-1.5">
                      Nombre completo *
                    </label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      placeholder="Tu nombre y apellido"
                      value={form.fullName}
                      onChange={setField}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="cedula" className="block text-xs font-bold text-glowe-muted mb-1.5">
                      Cédula / Documento *
                    </label>
                    <Input
                      id="cedula"
                      name="cedula"
                      type="text"
                      required
                      placeholder="Ej. 1020304050"
                      value={form.cedula}
                      onChange={setField}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-xs font-bold text-glowe-muted mb-1.5">
                      Correo electrónico *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="tucorreo@ejemplo.com"
                      value={form.email}
                      onChange={setField}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-xs font-bold text-glowe-muted mb-1.5">
                      Teléfono WhatsApp *
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="300 123 4567"
                      value={form.phone}
                      onChange={setField}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-xs font-bold text-glowe-muted mb-1.5">
                    Dirección de entrega *
                  </label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    required
                    placeholder="Calle, número, barrio y detalles"
                    value={form.address}
                    onChange={setField}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-xs font-bold text-glowe-muted mb-1.5">
                      Ciudad *
                    </label>
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      required
                      placeholder="Ej. Medellín"
                      value={form.city}
                      onChange={setField}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="department" className="block text-xs font-bold text-glowe-muted mb-1.5">
                      Departamento *
                    </label>
                    <Input
                      id="department"
                      name="department"
                      type="text"
                      required
                      placeholder="Ej. Antioquia"
                      value={form.department}
                      onChange={setField}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-xs font-bold text-glowe-muted mb-1.5">
                    Notas o indicaciones de entrega (opcional)
                  </label>
                  <Input
                    id="notes"
                    name="notes"
                    type="text"
                    placeholder="Ej. Casa de dos pisos, reja negra"
                    value={form.notes}
                    onChange={setField}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>

            <CheckoutPaymentMethodCard
              paymentMethods={paymentMethods}
              payment={payment}
              setPayment={setPayment}
              submitting={submitting}
            />
          </form>

          <CheckoutSummary
            items={items}
            subtotal={subtotal}
            shippingCost={shippingCost}
            total={total}
          />
        </div>
      </div>
    </div>
  )
}
