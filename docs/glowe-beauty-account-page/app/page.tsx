'use client'

import { useMemo, useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
  UserRound,
} from 'lucide-react'

type Status = 'En camino' | 'En preparación' | 'Entregado'
type Tab = 'orders' | 'details'

type Order = {
  id: string
  date: string
  status: Status
  total: string
  items: { name: string; variant: string; quantity: number; price: string; tone: string }[]
}

const orders: Order[] = [
  {
    id: '#ORD-2026-084', date: '18 de septiembre, 2026', status: 'En camino', total: '$128.000',
    items: [
      { name: 'Gloss Hidratante', variant: 'Tono 02 · Rosa Nude', quantity: 1, price: '$64.000', tone: 'bg-[#f8d8d7]' },
      { name: 'Rubor Soft Pinch', variant: 'Tono 04 · Melocotón', quantity: 1, price: '$64.000', tone: 'bg-[#f2b6a5]' },
    ],
  },
  {
    id: '#ORD-2026-071', date: '05 de septiembre, 2026', status: 'En preparación', total: '$86.000',
    items: [{ name: 'Bálsamo Voluminizador', variant: 'Tono Cherry · Translúcido', quantity: 1, price: '$86.000', tone: 'bg-[#d98b8c]' }],
  },
  {
    id: '#ORD-2026-043', date: '21 de agosto, 2026', status: 'Entregado', total: '$156.000',
    items: [
      { name: 'Skin Tint Serum', variant: 'Tono 03 · Light Warm', quantity: 1, price: '$92.000', tone: 'bg-[#d9ae91]' },
      { name: 'Highlighter Dew', variant: 'Tono Champagne', quantity: 1, price: '$64.000', tone: 'bg-[#e8c98c]' },
    ],
  },
]

const filters = ['Todos', 'Pendientes', 'En preparación', 'En camino', 'Entregados']

function StatusBadge({ status }: { status: Status }) {
  const config = {
    'En camino': { icon: Truck, classes: 'bg-[#59b1aa]/15 text-[#398f89]' },
    'En preparación': { icon: Clock3, classes: 'bg-[#f0b400]/15 text-[#aa7800]' },
    Entregado: { icon: CheckCircle2, classes: 'bg-emerald-100 text-emerald-700' },
  }[status]
  const Icon = config.icon
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${config.classes}`}><Icon className="size-3.5" />{status}</span>
}

export default function Page() {
  const [tab, setTab] = useState<Tab>('orders')
  const [filter, setFilter] = useState('Todos')
  const [saved, setSaved] = useState(false)
  const visibleOrders = useMemo(() => orders.filter((order) => filter === 'Todos' || (filter === 'Entregados' ? order.status === 'Entregado' : order.status === filter)), [filter])

  const changeTab = (next: Tab) => setTab(next)

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-4 py-6 text-[#2D2A2E] sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-[1.75rem] bg-[#FDE2E4] px-6 py-7 sm:px-9 sm:py-8">
          <div className="relative z-10 max-w-xl">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-[#b94d68]"><Sparkles className="size-3.5" /> Cliente verificada · Miembro Glow</div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">¡Hola, Camila! <span aria-hidden="true">✦</span></h1>
            <p className="mt-2 text-sm leading-6 text-[#735d61] sm:text-base">Gestiona tus compras, haz seguimiento en vivo y actualiza tus datos.</p>
          </div>
          <Sparkles aria-hidden="true" className="absolute -right-3 -top-8 size-40 rotate-12 text-white/45" strokeWidth={1} />
        </section>

        <div className="mt-6 flex gap-2 overflow-x-auto rounded-2xl bg-white p-1.5 shadow-sm md:hidden">
          {([['orders', 'Mis Pedidos (3)'], ['details', 'Mis Datos']] as [Tab, string][]).map(([value, label]) => <button key={value} onClick={() => changeTab(value)} className={`flex-1 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition ${tab === value ? 'bg-[#2D2A2E] text-white' : 'text-[#78716C] hover:bg-[#FAF8F5]'}`}>{label}</button>)}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[260px_1fr] lg:grid-cols-[280px_1fr]">
          <aside className="hidden md:block md:sticky md:top-6 md:self-start">
            <div className="rounded-3xl border border-[#f2dfe1] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3 border-b border-[#f3e9e7] pb-5">
                <div className="flex size-12 items-center justify-center rounded-full bg-[#FDE2E4] text-lg font-semibold text-[#b94d68]">CV</div>
                <div className="min-w-0"><p className="font-semibold">Camila Valencia</p><p className="mt-0.5 flex items-center gap-1 truncate text-xs text-[#78716C]"><Mail className="size-3" /> camila.v@email.com <ShieldCheck className="size-3 text-[#59b1aa]" /></p></div>
              </div>
              <nav className="flex flex-col gap-1 py-5" aria-label="Cuenta">
                <button onClick={() => changeTab('orders')} className={`flex items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium transition ${tab === 'orders' ? 'bg-[#FDE2E4] text-[#b94d68]' : 'text-[#78716C] hover:bg-[#FAF8F5]'}`}><span className="flex items-center gap-3"><Package className="size-4" /> Mis Pedidos</span><span className={`rounded-full px-2 py-0.5 text-[11px] ${tab === 'orders' ? 'bg-white' : 'bg-[#FAF8F5]'}`}>3</span></button>
                <button onClick={() => changeTab('details')} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${tab === 'details' ? 'bg-[#FDE2E4] text-[#b94d68]' : 'text-[#78716C] hover:bg-[#FAF8F5]'}`}><UserRound className="size-4" /> Mis Datos</button>
              </nav>
              <div className="border-t border-[#f3e9e7] pt-4"><button className="flex items-center gap-3 px-3 py-2 text-sm text-[#78716C] transition hover:text-[#2D2A2E]"><LogOut className="size-4" /> Cerrar sesión</button></div>
            </div>
          </aside>

          <section className="min-w-0">
            {tab === 'orders' ? <div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b94d68]">Tu actividad</p><h2 className="mt-1 text-2xl font-semibold">Mis Pedidos</h2></div><a href="#catalogo" className="inline-flex items-center gap-1 text-sm font-medium text-[#b94d68] hover:underline">Explorar catálogo <ArrowRight className="size-4" /></a></div>
              <div className="mt-5 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filtrar pedidos">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} role="tab" aria-selected={filter === item} className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-medium transition ${filter === item ? 'border-[#2D2A2E] bg-[#2D2A2E] text-white' : 'border-[#eadfdb] bg-white text-[#78716C] hover:border-[#b94d68] hover:text-[#b94d68]'}`}>{item}</button>)}</div>
              <div className="mt-5 flex flex-col gap-4">{visibleOrders.map((order) => <article key={order.id} className="rounded-3xl border border-[#f0e3df] bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#f3e9e7] pb-4"><div><h3 className="text-sm font-semibold">Pedido {order.id}</h3><p className="mt-1 text-xs text-[#78716C]">{order.date}</p></div><StatusBadge status={order.status} /></div><div className="flex flex-col gap-4 py-5">{order.items.map((item) => <div className="flex items-center gap-3" key={item.name}><div className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${item.tone} text-[10px] font-semibold tracking-widest text-white shadow-inner`}>GLOWE</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.name}</p><p className="mt-1 text-xs text-[#78716C]">{item.variant} <span className="mx-1">·</span> Cant. {item.quantity}</p></div><p className="text-sm font-medium">{item.price}</p></div>)}</div><div className="flex flex-col gap-4 border-t border-[#f3e9e7] pt-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs text-[#78716C]">Total del pedido</p><p className="mt-0.5 text-lg font-semibold">{order.total}</p></div><div className="flex flex-wrap gap-2"><a href={`https://wa.me/573001234567?text=${encodeURIComponent(`Hola Glowe Beauty, quiero consultar mi pedido ${order.id}`)}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#59b1aa] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#398f89]"><MessageCircle className="size-4" /> Consultar por WhatsApp</a><button className="inline-flex items-center justify-center gap-2 rounded-full border border-[#eadfdb] px-4 py-2.5 text-xs font-semibold text-[#78716C] transition hover:border-[#b94d68] hover:text-[#b94d68]"><RotateCcw className="size-3.5" /> Comprar de nuevo</button></div></div></article>)}</div>
              {visibleOrders.length === 0 && <div className="mt-5 flex flex-col items-center rounded-3xl border border-dashed border-[#e5d8d3] bg-white px-6 py-14 text-center"><Package className="size-9 text-[#d9a9b1]" strokeWidth={1.5} /><h3 className="mt-4 font-semibold">Aún no tienes pedidos aquí</h3><p className="mt-1 max-w-xs text-sm text-[#78716C]">Cuando hagas una compra, podrás ver todos los detalles en este espacio.</p><a href="#catalogo" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#FF758F] px-5 py-2.5 text-xs font-semibold text-white">Explorar catálogo <ChevronRight className="size-4" /></a></div>}
            </div> : <DetailsForm saved={saved} setSaved={setSaved} />}
          </section>
        </div>
      </div>
    </main>
  )
}

function DetailsForm({ saved, setSaved }: { saved: boolean; setSaved: (value: boolean) => void }) {
  return <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b94d68]">Tu perfil</p><h2 className="mt-1 text-2xl font-semibold">Mis Datos</h2><p className="mt-2 text-sm text-[#78716C]">Mantén tu información actualizada para recibir tus pedidos sin complicaciones.</p><form className="mt-5 rounded-3xl border border-[#f0e3df] bg-white p-5 shadow-sm sm:p-7" onSubmit={(event) => { event.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 3000) }}><div className="grid gap-5 sm:grid-cols-2"><label className="flex flex-col gap-2 text-sm font-medium sm:col-span-2">Nombre Completo<input defaultValue="Camila Valencia" className="rounded-xl border border-[#eadfdb] bg-[#FFFCFA] px-4 py-3 text-sm font-normal outline-none transition focus:border-[#FF758F] focus:ring-2 focus:ring-[#FDE2E4]" /></label><label className="flex flex-col gap-2 text-sm font-medium">Correo Electrónico<div className="relative"><Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#a8a09b]" /><input defaultValue="camila.v@email.com" type="email" className="w-full rounded-xl border border-[#eadfdb] bg-[#FFFCFA] py-3 pl-11 pr-10 text-sm font-normal outline-none transition focus:border-[#FF758F] focus:ring-2 focus:ring-[#FDE2E4]" /><ShieldCheck className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#59b1aa]" /></div></label><label className="flex flex-col gap-2 text-sm font-medium">Teléfono / WhatsApp<div className="flex rounded-xl border border-[#eadfdb] bg-[#FFFCFA] focus-within:border-[#FF758F] focus-within:ring-2 focus-within:ring-[#FDE2E4]"><span className="flex items-center gap-1 border-r border-[#eadfdb] px-3 text-sm text-[#78716C]">🇨🇴 +57</span><input defaultValue="300 123 4567" className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm font-normal outline-none" /></div></label><label className="flex flex-col gap-2 text-sm font-medium">Departamento y Ciudad<div className="relative"><MapPin className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#a8a09b]" /><select defaultValue="Bogotá, D.C." className="w-full appearance-none rounded-xl border border-[#eadfdb] bg-[#FFFCFA] px-4 py-3 pl-11 text-sm font-normal outline-none focus:border-[#FF758F]"><option>Bogotá, D.C.</option><option>Antioquia · Medellín</option><option>Valle del Cauca · Cali</option></select></div></label><label className="flex flex-col gap-2 text-sm font-medium">Dirección de Entrega y Barrio<input defaultValue="Cra. 11 # 84-25 · El Chicó" className="rounded-xl border border-[#eadfdb] bg-[#FFFCFA] px-4 py-3 text-sm font-normal outline-none transition focus:border-[#FF758F] focus:ring-2 focus:ring-[#FDE2E4]" /></label><label className="flex flex-col gap-2 text-sm font-medium sm:col-span-2">Instrucciones de entrega <span className="font-normal text-[#a8a09b]">(opcional)</span><textarea defaultValue="Dejar en recepción si no estoy disponible." rows={3} className="resize-none rounded-xl border border-[#eadfdb] bg-[#FFFCFA] px-4 py-3 text-sm font-normal outline-none transition focus:border-[#FF758F] focus:ring-2 focus:ring-[#FDE2E4]" /></label></div><div className="mt-6 flex flex-col items-start gap-3 border-t border-[#f3e9e7] pt-5 sm:flex-row sm:items-center"><button type="submit" className="rounded-xl bg-[#FF758F] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95">Guardar Cambios</button>{saved && <p className="flex items-center gap-2 text-sm font-medium text-[#398f89]" role="status"><CheckCircle2 className="size-4" /> Cambios guardados correctamente</p>}</div></form><div className="mt-4 flex items-center gap-2 rounded-2xl bg-[#FDE2E4]/60 px-4 py-3 text-xs text-[#735d61]"><Phone className="size-4 text-[#b94d68]" /> Usaremos estos datos solo para coordinar la entrega de tus pedidos.</div></div>
}
