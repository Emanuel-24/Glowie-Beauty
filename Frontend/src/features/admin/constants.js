/**
 * Constantes y valores por defecto para el panel administrativo de Glowe Beauty.
 */

export const formatCOP = (value) => `$${Number(value || 0).toLocaleString('es-CO')}`

export const formatId = (value, prefix = '', digits = 2) => {
  const index = Number(value)
  if (Number.isInteger(index) && index >= 1) return `${prefix}${String(index).padStart(digits, '0')}`
  return '—'
}

export const toDayKey = (date) => {
  const d = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date()
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-')
}

export const parseLocalDate = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value
  const match = String(value ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  if (value) {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return date
  }
  return new Date()
}

export const defaultProducts = [
  { id: 1, name: 'Glow Serum', category: 'Skincare', price: 68000, stock: 18, image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=500&q=80', badge: 'Nuevo' },
  { id: 2, name: 'Brow Lift', category: 'Maquillaje', price: 54000, stock: 7, image: 'https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=500&q=80', badge: 'Top' },
  { id: 3, name: 'Hydra Lip Oil', category: 'Labios', price: 39000, stock: 0, image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=500&q=80', badge: 'Popular' },
  { id: 4, name: 'Glow Mist', category: 'Cabello', price: 63000, stock: 12, image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=500&q=80', badge: 'Fresh' },
]

export const defaultCategories = [
  { id: 'cat-maquillaje', name: 'Maquillaje', description: 'Productos para rostro y looks diarios.', status: 'Activa', products: 42, revenue: '$1.240.000' },
  { id: 'cat-cabello', name: 'Cabello', description: 'Cuidado capilar y rutinas de brillo.', status: 'Activa', products: 18, revenue: '$640.000' },
  { id: 'cat-skincare', name: 'Skincare', description: 'Rutinas de hidratación y belleza.', status: 'Activa', products: 24, revenue: '$980.000' },
  { id: 'cat-labios', name: 'Labios', description: 'Brillos, tintas y cuidado labial.', status: 'Pausada', products: 9, revenue: '$240.000' },
]

export const defaultUsers = [
  { id: 1, name: 'María Gómez', email: 'maria@glowe.com', role: 'Admin', status: 'Activo', statusTone: 'success' },
  { id: 2, name: 'Valentina Ruiz', email: 'valentina@glowe.com', role: 'Cliente', status: 'Activo', statusTone: 'success' },
  { id: 3, name: 'Diana Torres', email: 'diana@glowe.com', role: 'Cliente', status: 'Bloqueado', statusTone: 'danger' },
  { id: 4, name: 'Sofía Reyes', email: 'sofia@glowe.com', role: 'Cliente', status: 'Activo', statusTone: 'success' },
]

export const defaultPurchases = [
  { id: 1, invoice: 'FAC-1042', date: '2026-09-20', customer: 'Sofía Muñoz', total: 145000, status: 'Completada', statusTone: 'success' },
  { id: 2, invoice: 'FAC-1041', date: '2026-09-18', customer: 'Valentina Ruiz', total: 98000, status: 'Anulada', statusTone: 'danger' },
  { id: 3, invoice: 'FAC-1040', date: '2026-09-15', customer: 'María López', total: 178000, status: 'Completada', statusTone: 'success' },
  { id: 4, invoice: 'FAC-1039', date: '2026-09-12', customer: 'Daniela Restrepo', total: 66000, status: 'Pendiente', statusTone: 'warning' },
]

export const emptyProductForm = {
  name: '',
  brand: 'Glowe Select',
  category: 'maquillaje',
  price: '',
  stock: '12',
  image: '',
  badge: 'Nuevo',
  desc: '',
  tags: [],
  isRecommended: false,
  recommendedOrder: '',
}

export const emptyCategoryForm = {
  name: '',
  description: '',
  status: 'Activa',
}

export const emptyTagForm = {
  name: '',
  description: '',
}

export const emptyOfferForm = {
  productId: '',
  name: '',
  brand: 'Glowe Select',
  image: '',
  isOffer: true,
  oldPrice: '',
  price: '',
  discountPercentage: '20',
  offerStartDate: '',
  offerEndDate: '',
  isFeaturedOffer: false,
}

export const emptyBundleForm = {
  name: '',
  desc: '',
  price: '',
  oldPrice: '',
  image: '',
  badge: 'TOP BUNDLE',
  productIds: [],
}

export const navItems = [
  { id: 'dashboard', label: 'Dashboard', emoji: '◈' },
  { id: 'categories', label: 'Categoría de productos', emoji: '▣' },
  { id: 'tags', label: 'Etiquetas / Tags', emoji: '🏷️' },
  { id: 'products', label: 'Productos', emoji: '◌' },
  { id: 'bundles', label: 'Combos y Kits', emoji: '🎁' },
  { id: 'offers', label: 'Ofertas y Descuentos', emoji: '⚡' },
  { id: 'orders', label: 'Compras', emoji: '◎' },
  { id: 'payments', label: 'Pagos y abonos', emoji: '◐' },
  { id: 'users', label: 'Usuarios', emoji: '◍' },
  { id: 'siteConfig', label: 'Configuración Web', emoji: '⚙️' },
]
