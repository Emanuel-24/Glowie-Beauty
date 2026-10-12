import { Info, ShieldCheck } from 'lucide-react'
import Card from '@/shared/components/ui/Card'
import Button from '@/shared/components/ui/Button'

export default function CheckoutPaymentMethodCard({
  paymentMethods = [],
  payment,
  setPayment,
  submitting,
}) {
  return (
    <Card className="space-y-4 p-4 sm:p-6">
      <h2 className="font-bold text-glowe-dark">Método de pago autorizado</h2>
      <fieldset className="space-y-3">
        <legend className="sr-only">Elije tu método de pago</legend>
        {paymentMethods.map((method) => {
          const isSelected = payment === method.id
          return (
            <div key={method.id} className="space-y-2">
              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-glowe-pink-accent bg-glowe-pink/30 shadow-xs'
                    : 'border-white/60 bg-white/40 hover:bg-white/70'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={method.id}
                  checked={isSelected}
                  onChange={() => setPayment(method.id)}
                  className="mt-0.5 accent-glowe-pink-accent"
                />
                <span className="flex-1">
                  <span className="block text-xs font-bold text-glowe-dark">{method.label}</span>
                  <span className="block text-[11px] text-glowe-muted mt-0.5">{method.desc}</span>
                </span>
              </label>

              {isSelected && method.notice && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-300/40 text-amber-900 text-xs">
                  <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <p className="leading-snug">{method.notice}</p>
                </div>
              )}
            </div>
          )
        })}
      </fieldset>

      <div className="pt-2">
        <Button
          type="submit"
          variant="gradient"
          fullWidth
          loading={submitting}
          disabled={submitting}
          className="py-3 text-sm font-bold shadow-md shadow-glowe-pink/30"
        >
          Confirmar pedido ✨
        </Button>
        <p className="mt-2 text-center text-[11px] text-glowe-muted flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Tus datos están protegidos y coordinamos el despacho contigo por WhatsApp.
        </p>
      </div>
    </Card>
  )
}
