import { useMemo } from 'react'
import { ShieldCheck, UserCheck, Headphones, Users, Lock, Check } from 'lucide-react'
import Card from '@/shared/components/ui/Card'
import Badge from '@/shared/components/ui/Badge'

const roleDefinitions = [
  {
    id: 'admin',
    name: 'Administrador (Admin)',
    icon: ShieldCheck,
    tone: 'info',
    isProtected: true,
    badgeText: 'Inmutable / Root',
    description: 'Control absoluto del panel, seguridad, gobernanza y configuración del sitio.',
    permissions: [
      'Gestión total de Catálogo (Productos, Categorías, Tags)',
      'Gestión y anulación de Compras / Pedidos',
      'Configuración de Descuentos, Ofertas y Bundles',
      'Administración de Usuarios y Asignación de Roles',
      'Configuración Web y Ajustes de Pasarela',
    ],
  },
  {
    id: 'editor',
    name: 'Editor de Catálogo',
    icon: UserCheck,
    tone: 'accent',
    isProtected: false,
    badgeText: 'Operativo Catálogo',
    description: 'Responsable del inventario comercial, descripciones de producto y promociones.',
    permissions: [
      'Crear, editar y optimizar Productos con imágenes WebP',
      'Gestión de Categorías y Etiquetas / Tags',
      'Configuración de Ofertas, Descuentos y Kits / Bundles',
      'Sin acceso a Facturación ni Gestión de Usuarios',
    ],
  },
  {
    id: 'soporte',
    name: 'Soporte y Ventas',
    icon: Headphones,
    tone: 'warning',
    isProtected: false,
    badgeText: 'Atención al Cliente',
    description: 'Seguimiento de compras de clientes, estados de entrega y recepción de abonos.',
    permissions: [
      'Visualizar y actualizar estado de Pedidos y Compras',
      'Revisión y confirmación de Pagos y Abonos',
      'Consulta de clientes y direcciones de envío',
      'Sin permisos para modificar precios ni eliminar catálogo',
    ],
  },
  {
    id: 'user',
    name: 'Cliente (User)',
    icon: Users,
    tone: 'neutral',
    isProtected: false,
    badgeText: 'Tienda Pública',
    description: 'Usuario comprador regular de la tienda Glowe Beauty.',
    permissions: [
      'Navegación completa del catálogo y carrito',
      'Creación de pedidos y pedidos vía WhatsApp',
      'Gestión de perfil y lista de favoritos',
      'Sin acceso al Panel Administrativo',
    ],
  },
]

export default function RolesTab({ users = [] }) {
  // Conteo dinámico de usuarios asignados a cada rol
  const roleCounts = useMemo(() => {
    const counts = { admin: 0, editor: 0, soporte: 0, user: 0 }
    users.forEach((u) => {
      const r = (u.rawRole || u.role || '').toLowerCase()
      if (r === 'admin' || r === 'administrador') counts.admin += 1
      else if (r === 'editor') counts.editor += 1
      else if (r === 'soporte') counts.soporte += 1
      else counts.user += 1
    })
    return counts
  }, [users])

  return (
    <div className="space-y-6">
      {/* Banner explicativo de gobernanza */}
      <div className="rounded-[1.8rem] border border-white/80 bg-white/70 p-5 shadow-xs backdrop-blur-md">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-glowe-pink-accent">
              Gobernanza de accesos
            </p>
            <p className="mt-1 text-xs text-glowe-muted">
              Matriz de privilegios y perfiles operativos. Los roles definen las capacidades de intervención dentro del panel administrativo y la tienda.
            </p>
          </div>
          <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-pink-200 bg-pink-50/80 px-3 py-1.5 text-xs font-semibold text-glowe-pink-accent">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            <span>Blindaje root: admin@glowe.com protegido</span>
          </div>
        </div>
      </div>

      {/* Grid de tarjetas de roles */}
      <div className="grid gap-4 md:grid-cols-2">
        {roleDefinitions.map((roleDef) => {
          const Icon = roleDef.icon
          const count = roleCounts[roleDef.id] || 0

          return (
            <Card
              key={roleDef.id}
              className="flex flex-col justify-between border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur-md"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-100/80 text-glowe-pink-accent shadow-xs">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-glowe-dark text-sm sm:text-base">
                        {roleDef.name}
                      </h3>
                      <span className="text-[11px] font-semibold text-glowe-muted">
                        {count} {count === 1 ? 'usuario asignado' : 'usuarios asignados'}
                      </span>
                    </div>
                  </div>

                  <Badge tone={roleDef.tone}>{roleDef.badgeText}</Badge>
                </div>

                <p className="text-xs text-glowe-muted">{roleDef.description}</p>

                <div className="space-y-1.5 border-t border-slate-100 pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
                    Permisos otorgados:
                  </p>
                  <ul className="space-y-1">
                    {roleDef.permissions.map((perm) => (
                      <li key={perm} className="flex items-center gap-2 text-xs text-glowe-dark">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{perm}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
