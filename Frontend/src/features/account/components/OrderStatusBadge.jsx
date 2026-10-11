import { Truck, Clock3, CheckCircle2 } from 'lucide-react'

export function getStatusConfig(status) {
  const normalized = String(status || '').toLowerCase()

  if (normalized.includes('camino') || normalized.includes('enviado') || normalized.includes('shipped')) {
    return {
      label: 'En camino',
      icon: Truck,
      badgeClasses: 'bg-[#59b1aa]/15 text-[#398f89]',
    }
  }

  if (
    normalized.includes('prepar') ||
    normalized.includes('proceso') ||
    normalized.includes('pend') ||
    normalized.includes('paid')
  ) {
    return {
      label: 'En preparación',
      icon: Clock3,
      badgeClasses: 'bg-[#f0b400]/15 text-[#aa7800]',
    }
  }

  if (normalized.includes('entreg') || normalized.includes('comple') || normalized.includes('delivered')) {
    return {
      label: 'Entregado',
      icon: CheckCircle2,
      badgeClasses: 'bg-emerald-100 text-emerald-700',
    }
  }

  return {
    label: status || 'En preparación',
    icon: Clock3,
    badgeClasses: 'bg-[#f0b400]/15 text-[#aa7800]',
  }
}

export default function OrderStatusBadge({ status }) {
  const config = getStatusConfig(status)
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${config.badgeClasses}`}>
      <Icon className="size-3.5" aria-hidden="true" />
      {config.label}
    </span>
  )
}
