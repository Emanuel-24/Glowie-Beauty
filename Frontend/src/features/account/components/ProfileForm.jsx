import { useState } from 'react'
import { Mail, ShieldCheck, MapPin, CheckCircle2, Phone } from 'lucide-react'
import Button from '@/shared/components/ui/Button'

export default function ProfileForm({ user, onSave }) {
  const [formData, setFormData] = useState({
    name: user?.name || 'Cliente Glowe',
    email: user?.email || '',
    phone: user?.phone || '300 123 4567',
    city: user?.city || 'Bogotá, D.C.',
    address: user?.address || 'Cra. 11 # 84-25 · El Chicó',
    deliveryNotes: user?.deliveryNotes || 'Dejar en recepción si no estoy disponible.',
  })

  const [saved, setSaved] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    if (onSave) {
      await onSave(formData)
    }
    setIsSubmitting(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3500)
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FF758F]">Tu perfil</p>
      <h2 className="mt-1 text-2xl font-semibold text-[#2D2A2E]">Mis Datos</h2>
      <p className="mt-2 text-sm text-[#78716C]">
        Mantén tu información actualizada para recibir tus pedidos sin complicaciones.
      </p>

      <form
        className="mt-5 rounded-3xl border border-[#f0e3df] bg-white p-5 shadow-sm sm:p-7"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-[#2D2A2E] sm:col-span-2">
            Nombre Completo
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="rounded-xl border border-[#eadfdb] bg-[#FFFCFA] px-4 py-3 text-sm font-normal text-[#2D2A2E] outline-none transition focus:border-[#FF758F] focus:ring-2 focus:ring-[#FDE2E4]"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-[#2D2A2E]">
            Correo Electrónico
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#a8a09b]" aria-hidden="true" />
              <input
                name="email"
                type="email"
                value={formData.email}
                readOnly
                className="w-full rounded-xl border border-[#eadfdb] bg-[#FAF8F5] py-3 pl-11 pr-10 text-sm font-normal text-[#78716C] outline-none cursor-not-allowed"
              />
              <ShieldCheck className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#59b1aa]" aria-hidden="true" />
            </div>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-[#2D2A2E]">
            Teléfono / WhatsApp
            <div className="flex rounded-xl border border-[#eadfdb] bg-[#FFFCFA] focus-within:border-[#FF758F] focus-within:ring-2 focus-within:ring-[#FDE2E4]">
              <span className="flex items-center gap-1 border-r border-[#eadfdb] px-3 text-sm text-[#78716C]">
                🇨🇴 +57
              </span>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="300 000 0000"
                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm font-normal text-[#2D2A2E] outline-none"
              />
            </div>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-[#2D2A2E]">
            Departamento y Ciudad
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#a8a09b]" aria-hidden="true" />
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full appearance-none rounded-xl border border-[#eadfdb] bg-[#FFFCFA] px-4 py-3 pl-11 text-sm font-normal text-[#2D2A2E] outline-none transition focus:border-[#FF758F] focus:ring-2 focus:ring-[#FDE2E4]"
              >
                <option value="Bogotá, D.C.">Bogotá, D.C.</option>
                <option value="Antioquia · Medellín">Antioquia · Medellín</option>
                <option value="Valle del Cauca · Cali">Valle del Cauca · Cali</option>
                <option value="Atlántico · Barranquilla">Atlántico · Barranquilla</option>
                <option value="Santander · Bucaramanga">Santander · Bucaramanga</option>
                <option value="Cundinamarca">Cundinamarca (Otros municipios)</option>
                <option value="Otra Ciudad / Municipio">Otra Ciudad / Municipio</option>
              </select>
            </div>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-[#2D2A2E]">
            Dirección de Entrega y Barrio
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Ej. Calle 100 # 15-20, Apto 302"
              className="rounded-xl border border-[#eadfdb] bg-[#FFFCFA] px-4 py-3 text-sm font-normal text-[#2D2A2E] outline-none transition focus:border-[#FF758F] focus:ring-2 focus:ring-[#FDE2E4]"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-[#2D2A2E] sm:col-span-2">
            Instrucciones de entrega <span className="font-normal text-[#a8a09b]">(opcional)</span>
            <textarea
              name="deliveryNotes"
              value={formData.deliveryNotes}
              onChange={handleChange}
              rows={3}
              placeholder="Ej. Dejar en portería o tocar timbre 201"
              className="resize-none rounded-xl border border-[#eadfdb] bg-[#FFFCFA] px-4 py-3 text-sm font-normal text-[#2D2A2E] outline-none transition focus:border-[#FF758F] focus:ring-2 focus:ring-[#FDE2E4]"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col items-start gap-3 border-t border-[#f3e9e7] pt-5 sm:flex-row sm:items-center">
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            className="!rounded-xl !bg-[#FF758F] !px-6 !py-3 !text-sm !font-semibold !text-white shadow-sm transition hover:opacity-95"
          >
            Guardar Cambios
          </Button>
          {saved && (
            <p className="flex items-center gap-2 text-sm font-medium text-[#398f89]" role="status">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Cambios guardados correctamente
            </p>
          )}
        </div>
      </form>

      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-[#FDE2E4]/60 px-4 py-3 text-xs text-[#735d61]">
        <Phone className="size-4 shrink-0 text-[#FF758F]" aria-hidden="true" />
        Usaremos estos datos solo para coordinar la entrega de tus pedidos.
      </div>
    </div>
  )
}
