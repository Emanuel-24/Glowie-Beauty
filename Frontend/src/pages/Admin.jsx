import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Orbit } from '@uiball/loaders'
import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productService'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService'
import { getUsers, createUser, updateUser, deleteUser } from '../services/userService'
import { getOrders, createOrder, updateOrder, deleteOrder } from '../services/orderService'
import { getPayments, createPayment, cancelPayment } from '../services/paymentService'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import ActionButton from '../components/ui/ActionButton'
import AdminModal from '../components/ui/AdminModal'
import DataTable from '../components/ui/DataTable'
import StatusBadge from '../components/ui/StatusBadge'

const formatCOP = (value) => `$${Number(value || 0).toLocaleString('es-CO')}`

const formatId = (value, prefix = '', digits = 2) => {
  const index = Number(value)
  if (Number.isInteger(index) && index >= 1) return `${prefix}${String(index).padStart(digits, '0')}`
  return '—'
}

const toDayKey = (date) => {
  const d = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date()
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-')
}

const parseLocalDate = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value
  const match = String(value ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  if (value) {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return date
  }
  return new Date()
}

const defaultProducts = [
  { id: 1, name: 'Glow Serum', category: 'Skincare', price: 68000, stock: 18, image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=500&q=80', badge: 'Nuevo' },
  { id: 2, name: 'Brow Lift', category: 'Maquillaje', price: 54000, stock: 7, image: 'https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=500&q=80', badge: 'Top' },
  { id: 3, name: 'Hydra Lip Oil', category: 'Labios', price: 39000, stock: 0, image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=500&q=80', badge: 'Popular' },
  { id: 4, name: 'Glow Mist', category: 'Cabello', price: 63000, stock: 12, image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=500&q=80', badge: 'Fresh' },
]

const defaultCategories = [
  { id: 'cat-maquillaje', name: 'Maquillaje', description: 'Productos para rostro y looks diarios.', status: 'Activa', products: 42, revenue: '$1.240.000' },
  { id: 'cat-cabello', name: 'Cabello', description: 'Cuidado capilar y rutinas de brillo.', status: 'Activa', products: 18, revenue: '$640.000' },
  { id: 'cat-skincare', name: 'Skincare', description: 'Rutinas de hidratación y belleza.', status: 'Activa', products: 24, revenue: '$980.000' },
  { id: 'cat-labios', name: 'Labios', description: 'Brillos, tintas y cuidado labial.', status: 'Pausada', products: 9, revenue: '$240.000' },
]

const defaultUsers = [
  { id: 1, name: 'María Gómez', email: 'maria@glowe.com', role: 'Admin', status: 'Activo', statusTone: 'success' },
  { id: 2, name: 'Valentina Ruiz', email: 'valentina@glowe.com', role: 'Cliente', status: 'Activo', statusTone: 'success' },
  { id: 3, name: 'Diana Torres', email: 'diana@glowe.com', role: 'Cliente', status: 'Bloqueado', statusTone: 'danger' },
  { id: 4, name: 'Sofía Reyes', email: 'sofia@glowe.com', role: 'Cliente', status: 'Activo', statusTone: 'success' },
]

const defaultPurchases = [
  { id: 1, invoice: 'FAC-1042', date: '2026-09-20', customer: 'Sofía Muñoz', total: 145000, status: 'Completada', statusTone: 'success' },
  { id: 2, invoice: 'FAC-1041', date: '2026-09-18', customer: 'Valentina Ruiz', total: 98000, status: 'Anulada', statusTone: 'danger' },
  { id: 3, invoice: 'FAC-1040', date: '2026-09-15', customer: 'María López', total: 178000, status: 'Completada', statusTone: 'success' },
  { id: 4, invoice: 'FAC-1039', date: '2026-09-12', customer: 'Daniela Restrepo', total: 66000, status: 'Pendiente', statusTone: 'warning' },
]

const emptyProductForm = {
  name: '',
  category: 'maquillaje',
  price: '',
  stock: '12',
  image: '',
  badge: 'Nuevo',
  desc: '',
  isRecommended: false,
  recommendedOrder: '',
}

const emptyCategoryForm = {
  name: '',
  description: '',
  status: 'Activa',
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', emoji: '◈' },
  { id: 'categories', label: 'Categoría de productos', emoji: '▣' },
  { id: 'products', label: 'Productos', emoji: '◌' },
  { id: 'orders', label: 'Compras', emoji: '◎' },
  { id: 'payments', label: 'Pagos y abonos', emoji: '◐' },
  { id: 'users', label: 'Usuarios', emoji: '◍' },
]

function GloweeLogo() {
  return (
    <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-4 border-white/80 bg-gradient-to-br from-[#ffd6e6] via-[#fff7d6] to-[#ccecff] shadow-[0_14px_32px_rgba(165,105,136,0.25)]">
      <img src="/Logo.png" alt="GLOWE BEAUTY Logo" className="h-full w-full object-cover" />
    </div>
  )
}

gsap.registerPlugin(ScrollTrigger)

export default function Admin() {
  const navigate = useNavigate()
  const panelRef = useRef(null)
  const { showToast } = useToast()
  const { user, logout } = useAuth()
  const [products, setProducts] = useState(defaultProducts)
  const [moduleReady, setModuleReady] = useState(false)
  const [categories, setCategories] = useState(defaultCategories)
  const [users, setUsers] = useState(defaultUsers)
  const [purchases, setPurchases] = useState(defaultPurchases)
  const [payments, setPayments] = useState([])
  const [activeModule, setActiveModule] = useState('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [searches, setSearches] = useState({ dashboard: '', categories: '', products: '', orders: '', payments: '', users: '' })
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState(null)
  const [productForm, setProductForm] = useState(emptyProductForm)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm)

  useEffect(() => {
    let active = true
    setModuleReady(false)

    Promise.allSettled([getProducts(), getCategories(), getOrders(), getUsers(), getPayments()])
      .then(([items, categoryItems, orderItems, userItems, paymentItems]) => {
        if (!active) return

        if (items.status === 'fulfilled' && Array.isArray(items.value) && items.value.length > 0) {
          setProducts(
            items.value.map((item, index) => ({
              id: item.id ?? item._id ?? index + 1,
              name: item.name || `Producto ${index + 1}`,
              category: item.category || 'maquillaje',
              price: Number(item.price ?? 0),
              stock: Number(item.stock ?? 0),
              image: item.image || item.images?.[0] || defaultProducts[0].image,
              badge: item.badge || 'Nuevo',
              desc: item.desc || item.description || 'Producto de la colección Glowe.',
              isRecommended: Boolean(item.isRecommended),
              recommendedOrder: Number(item.recommendedOrder ?? 0),
            })),
          )
        }

        if (categoryItems.status === 'fulfilled' && Array.isArray(categoryItems.value) && categoryItems.value.length > 0) {
          setCategories(
            categoryItems.value.map((item) => ({
              id: item.id ?? item._id ?? Date.now().toString(),
              name: item.name || 'Categoría',
              products: Number(item.products || 0),
              revenue: item.revenue || '$0',
              status: item.status || 'Activa',
              statusTone: item.status === 'Pausada' ? 'warning' : 'success',
            })),
          )
        }

        if (orderItems.status === 'fulfilled' && Array.isArray(orderItems.value) && orderItems.value.length > 0) {
          setPurchases(
            orderItems.value.map((item, index) => {
              const fallbackDate = defaultPurchases[index % defaultPurchases.length].date
              const createdAt = item.createdAt ? new Date(item.createdAt) : parseLocalDate(fallbackDate)
              return {
                id: item.id ?? item._id ?? index + 1,
                invoice: item.invoice || `FAC-${String(index + 1).padStart(4, '0')}`,
                date: item.createdAt ? createdAt.toLocaleDateString('es-CO') : fallbackDate,
                createdAt,
                customer: item.customer || 'Cliente Glowe',
                total: Number(item.total ?? 0),
                status: item.status || 'Pendiente',
                statusTone: item.status === 'Completada' ? 'success' : item.status === 'Anulada' ? 'danger' : 'warning',
              }
            }),
          )
        }

        if (userItems.status === 'fulfilled' && Array.isArray(userItems.value) && userItems.value.length > 0) {
          setUsers(
            userItems.value.map((item, index) => ({
              id: item.id ?? item._id ?? index + 1,
              name: item.name || 'Usuario Glowe',
              email: item.email || 'usuario@glowe.com',
              role: item.role === 'admin' ? 'Admin' : 'Cliente',
              status: item.status === 'Bloqueado' ? 'Bloqueado' : 'Activo',
              statusTone: item.status === 'Bloqueado' ? 'danger' : 'success',
            })),
          )
        }

        if (paymentItems.status === 'fulfilled' && Array.isArray(paymentItems.value) && paymentItems.value.length > 0) {
          setPayments(
            paymentItems.value.map((item) => ({
              id: item.id ?? item._id,
              orderId: item.orderId,
              customer: item.userId?.name || item.userId || 'Cliente',
              amount: Number(item.amount || 0),
              method: item.method || 'Transferencia',
              status: item.status || 'Confirmado',
              statusTone: item.status === 'Anulado' ? 'danger' : 'success',
              createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-CO') : 'Hoy',
            })),
          )
        } else {
          setPayments([])
        }
      })
      .finally(() => {
        if (active) {
          window.setTimeout(() => setModuleReady(true), 350)
        }
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!panelRef.current || !moduleReady) return undefined

    const ctx = gsap.context(() => {
      gsap.from('.admin-module-card', {
        y: 18,
        opacity: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: panelRef.current,
          start: 'top 85%',
        },
      })
    }, panelRef)

    return () => ctx.revert()
  }, [moduleReady, activeModule])

  const summary = useMemo(() => {
    const todayKey = toDayKey(new Date())
    return {
      totalProducts: products.length,
      revenue: purchases.reduce((sum, order) => sum + Number(order?.total || 0), 0),
      todayOrders: purchases.filter((order) => toDayKey(order?.createdAt) === todayKey).length,
      newCustomers: new Set(purchases.map((order) => String(order?.customer || '').trim().toLowerCase()).filter(Boolean)).size,
      lowStock: products.filter((item) => Number(item.stock || 0) < 10).length,
      pending: purchases.filter((order) => String(order?.status || '').toLowerCase() !== 'completada').length,
    }
  }, [purchases, products.length])

  const last7Days = useMemo(() => {
    const days = []
    const today = new Date()
    for (let offset = 6; offset >= 0; offset -= 1) {
      const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset)
      const label = day.toLocaleDateString('es-CO', { weekday: 'short' })
      days.push({
        key: toDayKey(day),
        label: label.charAt(0).toUpperCase() + label.slice(1),
      })
    }

    const totalsByDay = new Map(days.map((day) => [day.key, 0]))
    purchases.forEach((order) => {
      const key = toDayKey(order?.createdAt)
      if (totalsByDay.has(key)) {
        totalsByDay.set(key, totalsByDay.get(key) + Number(order?.total || 0))
      }
    })

    const max = Math.max(1, ...days.map((day) => totalsByDay.get(day.key)))
    return {
      total7d: days.reduce((sum, day) => sum + totalsByDay.get(day.key), 0),
      values: days.map((day) => ({
        ...day,
        total: totalsByDay.get(day.key),
        height: Math.round((totalsByDay.get(day.key) / max) * 100),
      })),
    }
  }, [purchases])

  const currentSearch = searches[activeModule] || ''

  const categoryRows = useMemo(
    () =>
      categories.map((item) => ({
        id: item.id,
        name: item.name,
        products: item.products,
        revenue: item.revenue,
        status: item.status,
        statusTone: item.statusTone || 'success',
      })),
    [categories],
  )

  const productRows = useMemo(
    () =>
      products.map((product, index) => ({
        id: product.id ?? `${product.name}-${index}`,
        number: String(index + 1).padStart(2, '0'),
        image: product.image,
        name: product.name,
        category: product.category,
        price: formatCOP(product.price),
        priceValue: Number(product.price || 0),
        stock: Number(product.stock || 0),
        stockLabel: Number(product.stock || 0) > 0 ? 'En stock' : 'Agotado',
        stockTone: Number(product.stock || 0) > 0 ? 'success' : 'danger',
        badge: product.badge || 'Nuevo',
        desc: product.desc || '',
      })),
    [products],
  )

  const userRows = useMemo(
    () =>
      users.map((item, index) => ({
        id: item.id ?? `${item.email}-${index}`,
        number: String(index + 1).padStart(2, '0'),
        name: item.name,
        email: item.email,
        role: item.role,
        roleTone: item.role === 'Admin' ? 'info' : 'neutral',
        status: item.status,
        statusTone: item.statusTone || 'success',
      })),
    [users],
  )

const orderRows = useMemo(
    () =>
      purchases.map((item, index) => ({
        id: item.id ?? `${item.invoice}-${index}`,
        number: String(index + 1).padStart(2, '0'),
        invoice: formatId(index + 1, 'FAC-'),
        date: item.date,
        customer: item.customer,
        total: formatCOP(item.total),
        totalValue: Number(item.total || 0),
        status: item.status,
        statusTone: item.statusTone || 'success',
      })),
    [purchases],
  )

  const paymentRows = useMemo(() => {
    const seqByOrderId = new Map(purchases.map((order, index) => [String(order.id ?? order._id ?? ''), index + 1]))
    return payments.map((item, index) => {
      const seq = seqByOrderId.get(String(item.orderId ?? '')) ?? index + 1
      return {
        id: item.id,
        orderLabel: formatId(seq, 'Orden #'),
        customer: item.customer || 'Cliente',
        method: item.method,
        amount: formatCOP(item.amount),
        amountValue: Number(item.amount || 0),
        status: item.status,
        statusTone: item.statusTone || 'success',
        createdAt: item.createdAt,
      }
    })
  }, [payments, purchases])

  const categoryColumns = [
    { key: 'name', header: 'Categoría', render: (row) => <div><p className="font-semibold text-glowe-dark">{row.name}</p></div> },
    { key: 'products', header: 'Productos', render: (row) => <span className="text-sm font-semibold text-glowe-dark">{row.products}</span> },
    { key: 'revenue', header: 'Ventas', render: (row) => <span className="font-bold text-glowe-dark">{row.revenue}</span> },
    { key: 'status', header: 'Estado', render: (row) => <StatusBadge label={row.status} tone={row.statusTone || (row.status === 'Pausada' ? 'warning' : 'success')} /> },
    {
      key: 'actions',
      header: 'Acciones',
      render: (row) => (
        <div className="flex items-center gap-2">
          <ActionButton type="edit" title="Editar" onClick={() => openCategoryModal(row)}>Editar</ActionButton>
          <ActionButton type="delete" title="Eliminar" onClick={() => handleDeleteCategory(row.id)}>Eliminar</ActionButton>
        </div>
      ),
    },
  ]

  const productColumns = [
    { key: 'number', header: '#', className: 'w-16', render: (row) => <span className="font-bold text-glowe-muted">{row.number}</span> },
    { key: 'image', header: 'Imagen', render: (row) => <img src={row.image} alt={row.name} className="h-12 w-12 rounded-xl object-cover ring-1 ring-glowe-pink/20" loading="lazy" /> },
    { key: 'name', header: 'Nombre', render: (row) => <div><p className="font-semibold text-glowe-dark">{row.name}</p><p className="text-[10px] uppercase tracking-[0.14em] text-glowe-muted">{row.badge}</p></div> },
    { key: 'category', header: 'Categoría', render: (row) => <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-glowe-muted">{row.category}</span> },
    { key: 'price', header: 'Precio', render: (row) => <span className="font-bold text-glowe-dark">{row.price}</span> },
    { key: 'stock', header: 'Stock', render: (row) => <StatusBadge label={row.stockLabel} tone={row.stockTone} /> },
    {
      key: 'actions',
      header: 'Acciones',
      render: (row) => (
        <div className="flex items-center gap-2">
          <ActionButton type="view" title="Ver" >Ver</ActionButton>
          <ActionButton type="edit" title="Editar" onClick={() => openProductModal(row)}>Editar</ActionButton>
          <ActionButton type="delete" title="Eliminar" onClick={() => handleDeleteProduct(row.id)}>Eliminar</ActionButton>
        </div>
      ),
    },
  ]

  const userColumns = [
    { key: 'number', header: '#', className: 'w-16', render: (row) => <span className="font-bold text-glowe-muted">{row.number}</span> },
    { key: 'name', header: 'Nombre', render: (row) => <div><p className="font-semibold text-glowe-dark">{row.name}</p></div> },
    { key: 'email', header: 'Email', render: (row) => <span className="text-sm text-glowe-muted">{row.email}</span> },
    { key: 'role', header: 'Rol', render: (row) => <StatusBadge label={row.role} tone={row.roleTone} /> },
    { key: 'status', header: 'Estado', render: (row) => <StatusBadge label={row.status} tone={row.statusTone} /> },
    {
      key: 'actions',
      header: 'Acciones',
      render: (row) => (
        <div className="flex items-center gap-2">
          <ActionButton type="edit" title="Editar rol" onClick={() => toggleUserRole(row.id)}>Editar rol</ActionButton>
          <ActionButton type="delete" title={row.status === 'Bloqueado' ? 'Activar' : 'Bloquear'} onClick={() => toggleUserStatus(row.id)}>{row.status === 'Bloqueado' ? 'Activar' : 'Bloquear'}</ActionButton>
          <ActionButton type="delete" title="Eliminar" onClick={() => handleDeleteUser(row.id)}>Eliminar</ActionButton>
        </div>
      ),
    },
  ]

  const orderColumns = [
    { key: 'number', header: '#', className: 'w-16', render: (row) => <span className="font-bold text-glowe-muted">{row.number}</span> },
    { key: 'invoice', header: 'Factura', render: (row) => <span className="font-semibold text-glowe-dark">{row.invoice}</span> },
    { key: 'date', header: 'Fecha', render: (row) => <span className="text-sm text-glowe-muted">{row.date}</span> },
    { key: 'customer', header: 'Cliente', render: (row) => <span className="font-medium text-glowe-dark">{row.customer}</span> },
    { key: 'total', header: 'Total', render: (row) => <span className="font-bold text-glowe-dark">{row.total}</span> },
    { key: 'status', header: 'Estado', render: (row) => <StatusBadge label={row.status} tone={row.statusTone} /> },
    {
      key: 'actions',
      header: 'Acciones',
      render: (row) => (
        <div className="flex items-center gap-2">
          <ActionButton type="view" title="Ver detalle">Ver detalle</ActionButton>
          <ActionButton type="edit" title="Cambiar estado" onClick={() => togglePurchaseStatus(row.id)}>Cambiar estado</ActionButton>
          <ActionButton type="delete" title="Anular" onClick={() => handleDeletePurchase(row.id)}>Anular</ActionButton>
        </div>
      ),
    },
  ]

  const paymentColumns = [
    { key: 'orderLabel', header: 'Orden', render: (row) => <span className="font-semibold text-glowe-dark">{row.orderLabel}</span> },
    { key: 'customer', header: 'Cliente', render: (row) => <span className="text-sm text-glowe-dark">{row.customer}</span> },
    { key: 'method', header: 'Método', render: (row) => <span className="text-sm text-glowe-muted">{row.method}</span> },
    { key: 'amount', header: 'Abono', render: (row) => <span className="font-bold text-glowe-dark">{row.amount}</span> },
    { key: 'createdAt', header: 'Fecha', render: (row) => <span className="text-sm text-glowe-muted">{row.createdAt}</span> },
    { key: 'status', header: 'Estado', render: (row) => <StatusBadge label={row.status} tone={row.statusTone} /> },
    {
      key: 'actions',
      header: 'Acciones',
      render: (row) => (
        <div className="flex items-center gap-2">
          <ActionButton type="delete" title="Anular" onClick={() => handleDeletePayment(row.id)}>Anular</ActionButton>
        </div>
      ),
    },
  ]

  const currentModuleRows =
    activeModule === 'categories'
      ? categoryRows
      : activeModule === 'products'
        ? productRows
        : activeModule === 'orders'
          ? orderRows
          : activeModule === 'payments'
            ? paymentRows
            : userRows
  const currentModuleColumns =
    activeModule === 'categories'
      ? categoryColumns
      : activeModule === 'products'
        ? productColumns
        : activeModule === 'orders'
          ? orderColumns
          : activeModule === 'payments'
            ? paymentColumns
            : userColumns

  const confirmDestructiveAction = (message) => {
    if (typeof window !== 'undefined' && window.confirm) {
      return window.confirm(message)
    }

    return true
  }

  const openProductModal = (product = null) => {
    if (product) {
      setEditingProductId(product.id)
      setProductForm({
        name: product.name || '',
        category: product.category || 'maquillaje',
        price: String(product.priceValue ?? product.price ?? ''),
        stock: String(product.stock ?? 12),
        image: product.image || '',
        badge: product.badge || 'Nuevo',
        desc: product.desc || '',
        isRecommended: Boolean(product.isRecommended),
        recommendedOrder: String(product.recommendedOrder ?? ''),
      })
    } else {
      setEditingProductId(null)
      setProductForm(emptyProductForm)
    }
    setProductModalOpen(true)
  }

  const openCategoryModal = (category = null) => {
    if (category) {
      setEditingCategoryId(category.id)
      setCategoryForm({
        name: category.name || '',
        description: category.description || '',
        status: category.status || 'Activa',
      })
    } else {
      setEditingCategoryId(null)
      setCategoryForm(emptyCategoryForm)
    }
    setCategoryModalOpen(true)
  }

  const moduleMeta = {
    dashboard: { title: 'Dashboard' },
    categories: { title: 'Categoría de productos', action: () => openCategoryModal() },
    products: { title: 'Productos', action: () => openProductModal() },
    orders: {
      title: 'Compras',
      action: async () => {
        const generatedOrder = {
          userId: user?._id || user?.id || 'authenticated-user',
          invoice: `FAC-${Date.now()}`,
          customer: user?.name || 'Cliente nuevo',
          total: 85000,
          status: 'Pendiente',
          shippingAddress: 'Bogotá, Colombia',
          items: [{ productId: products[0]?._id || products[0]?.id || 'demo-product', title: products[0]?.name || 'Glow Serum', quantity: 1, price: 85000 }],
        }

        const result = await createOrder(generatedOrder)
        const savedOrder = result?.data ?? generatedOrder
        setPurchases((prev) => [{
          id: savedOrder.id ?? Date.now(),
          invoice: savedOrder.invoice || generatedOrder.invoice,
          date: new Date().toLocaleDateString('es-CO'),
          createdAt: new Date(),
          customer: savedOrder.customer || generatedOrder.customer,
          total: Number(savedOrder.total ?? generatedOrder.total),
          status: savedOrder.status || 'Pendiente',
          statusTone: savedOrder.status === 'Completada' ? 'success' : savedOrder.status === 'Anulada' ? 'danger' : 'warning',
        }, ...prev])
      },
    },
    payments: {
      title: 'Pagos y abonos',
      action: async () => {
        if (!purchases.length) {
          showToast('Sin compras', 'Primero crea una orden para registrar un abono.', '⚠️')
          return
        }

        const order = purchases[0]
        const amount = Math.min(Number(order.total || 0), 50000)
        const result = await createPayment({
          orderId: order.id,
          amount,
          method: 'Transferencia',
          reference: `AB-${Date.now()}`,
          note: 'Abono registrado desde el panel administrativo',
        })

        const savedPayment = result?.payment ?? result
        if (!savedPayment) return

        setPayments((prev) => [{
          id: savedPayment.id ?? `pay-${Date.now()}`,
          orderId: savedPayment.orderId ?? order.id,
          customer: order.customer,
          amount: Number(savedPayment.amount ?? amount),
          method: savedPayment.method || 'Transferencia',
          status: savedPayment.status || 'Confirmado',
          statusTone: savedPayment.status === 'Anulado' ? 'danger' : 'success',
          createdAt: new Date().toLocaleDateString('es-CO'),
        }, ...prev])

        showToast('Abono registrado', `Se registró ${formatCOP(Number(savedPayment.amount ?? amount))} a la orden ${order.invoice}.`, '✅')
      },
    },
    users: {
      title: 'Usuarios',
      action: async () => {
        const generatedUser = {
          name: 'Nuevo usuario',
          email: `usuario${Date.now()}@glowe.com`,
          password: 'glowe2024',
          role: 'user',
          status: 'Activo',
        }

        const result = await createUser(generatedUser)
        const savedUser = result?.data ?? generatedUser
        setUsers((prev) => [{
          id: savedUser.id ?? Date.now(),
          name: savedUser.name || generatedUser.name,
          email: savedUser.email || generatedUser.email,
          role: savedUser.role === 'admin' ? 'Admin' : 'Cliente',
          status: savedUser.status || 'Activo',
          statusTone: savedUser.status === 'Bloqueado' ? 'danger' : 'success',
        }, ...prev])
      },
    },
  }

  const exportCurrentTable = (type) => {
    let payload
    let title

    if (activeModule === 'dashboard') {
      payload = [
        { Metrica: 'Ventas totales', Valor: formatCOP(summary.revenue) },
        { Metrica: 'Pedidos registrados', Valor: String(purchases.length) },
        { Metrica: 'Pedidos hoy', Valor: String(summary.todayOrders) },
        { Metrica: 'Clientes únicos', Valor: String(summary.newCustomers) },
        { Metrica: 'Ventas últimos 7 días', Valor: formatCOP(last7Days.total7d) },
        { Metrica: 'Productos en catálogo', Valor: String(summary.totalProducts) },
        { Metrica: 'Stock crítico', Valor: String(summary.lowStock) },
      ]
      title = 'reporte-dashboard'
    } else {
      payload = currentModuleRows.map((row) => {
        if (activeModule === 'categories') {
          return { Nombre: row.name, Productos: row.products, Ventas: row.revenue, Estado: row.status }
        }
        if (activeModule === 'products') {
          return { Nombre: row.name, Categoria: row.category, Precio: row.priceValue, Stock: row.stock, Estado: row.stockLabel }
        }
        if (activeModule === 'orders') {
          return { Factura: row.invoice, Fecha: row.date, Cliente: row.customer, Total: row.totalValue, Estado: row.status }
        }
        if (activeModule === 'payments') {
          return { Orden: row.orderLabel, Cliente: row.customer, Metodo: row.method, Monto: row.amountValue, Estado: row.status }
        }
        return { Nombre: row.name, Email: row.email, Rol: row.role, Estado: row.status }
      })

      title = activeModule === 'categories'
        ? 'reporte-categorias'
        : activeModule === 'products'
          ? 'reporte-productos'
          : activeModule === 'orders'
            ? 'reporte-compras'
            : activeModule === 'payments'
              ? 'reporte-pagos'
              : 'reporte-usuarios'
    }

    if (type === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(payload)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte')
      XLSX.writeFile(workbook, `${title}.xlsx`)
      return
    }

    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const paintHeader = () => {
      doc.setFillColor(250, 239, 245)
      doc.rect(0, 0, 595, 842, 'F')
      doc.setTextColor(40, 27, 39)
      doc.setFontSize(18)
      doc.text('Glowe Beauty - Reporte', 42, 52)
      doc.setFontSize(11)
      doc.text(`Módulo: ${moduleMeta[activeModule].title}`, 42, 78)
    }

    paintHeader()
    let line = 110
    payload.forEach((item, index) => {
      const text = `${index + 1}. ${Object.values(item).join(' | ')}`
      const lines = doc.splitTextToSize(text, 500)
      if (line + lines.length * 24 > 800) {
        doc.addPage()
        paintHeader()
        line = 110
      }
      doc.text(lines, 42, line)
      line += lines.length * 24 + 6
    })

    doc.save(`${title}.pdf`)
  }

  const toggleUserRole = async (id) => {
    const target = users.find((item) => item.id === id)
    if (!target) return

    const nextRole = target.role === 'Admin' ? 'Cliente' : 'Admin'
    const result = await updateUser(id, { role: nextRole === 'Admin' ? 'admin' : 'user' })

    if (result?.ok !== false) {
      setUsers((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, role: nextRole } : item,
        ),
      )
      showToast('Rol actualizado', `El usuario ahora es ${nextRole}.`, '✅')
    }
  }

  const toggleUserStatus = async (id) => {
    const target = users.find((item) => item.id === id)
    if (!target) return

    const nextStatus = target.status === 'Bloqueado' ? 'Activo' : 'Bloqueado'
    const result = await updateUser(id, { status: nextStatus })

    if (result?.ok !== false) {
      setUsers((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item
          return { ...item, status: nextStatus, statusTone: nextStatus === 'Activo' ? 'success' : 'danger' }
        }),
      )
      showToast('Estado actualizado', `El usuario quedó ${nextStatus}.`, '✅')
    }
  }

  const handleDeleteUser = async (id) => {
    const shouldDelete = confirmDestructiveAction('¿Eliminar este usuario y su acceso?')
    if (!shouldDelete) return

    const result = await deleteUser(id)
    if (result?.ok === false) return
    setUsers((prev) => prev.filter((item) => (item.id ?? item._id) !== id))
    showToast('Usuario eliminado', 'Se eliminó el acceso del usuario.', '🗑️')
  }

  const togglePurchaseStatus = async (id) => {
    const target = purchases.find((item) => item.id === id)
    if (!target) return

    const nextStatus = target.status === 'Pendiente' ? 'Completada' : target.status === 'Completada' ? 'Anulada' : 'Pendiente'
    const result = await updateOrder(id, { status: nextStatus })

    if (result?.ok !== false) {
      setPurchases((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item
          return {
            ...item,
            status: nextStatus,
            statusTone: nextStatus === 'Completada' ? 'success' : nextStatus === 'Anulada' ? 'danger' : 'warning',
          }
        }),
      )
      showToast('Pedido actualizado', `El pedido quedó en ${nextStatus}.`, '✅')
    }
  }

  const handleDeletePurchase = async (id) => {
    const shouldDelete = confirmDestructiveAction('¿Anular esta compra y quitarla del panel?')
    if (!shouldDelete) return

    const result = await deleteOrder(id)
    if (result?.ok === false) return
    setPurchases((prev) => prev.filter((item) => (item.id ?? item._id) !== id))
    showToast('Compra anulada', 'La compra fue eliminada del registro.', '🗑️')
  }

  const handleDeletePayment = async (id) => {
    const shouldDelete = confirmDestructiveAction('¿Anular este pago o abono registrado?')
    if (!shouldDelete) return

    const result = await cancelPayment(id)
    if (result?.ok === false) return
    setPayments((prev) => prev.map((item) => item.id === id ? { ...item, status: 'Anulado', statusTone: 'danger' } : item))
    showToast('Pago anulado', 'El movimiento quedó marcado como anulado.', '🗑️')
  }

  const handleDeleteProduct = async (id) => {
    const shouldDelete = confirmDestructiveAction('¿Eliminar este producto del catálogo?')
    if (!shouldDelete) return

    const result = await deleteProduct(id)
    if (result?.ok === false) return

    setProducts((prev) => prev.filter((product) => (product.id ?? product._id) !== id))
    showToast('Producto eliminado', 'Se retiró del catálogo.', '🗑️')
  }

  const handleProductSubmit = async (event) => {
    event.preventDefault()

    const payload = {
      id: editingProductId ?? Date.now(),
      name: productForm.name.trim() || 'Nuevo producto',
      category: productForm.category,
      price: Number(productForm.price) || 0,
      stock: Number(productForm.stock) || 0,
      image: productForm.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=500&q=80',
      badge: productForm.badge || 'Nuevo',
      desc: productForm.desc || 'Producto de la colección Glowe.',
      description: productForm.desc || 'Producto de la colección Glowe.',
      isRecommended: Boolean(productForm.isRecommended),
      recommendedOrder: Number(productForm.recommendedOrder ?? 0),
    }

    let savedProduct
    if (editingProductId) {
      savedProduct = await updateProduct(editingProductId, payload)
      setProducts((prev) => prev.map((item) => ((item.id ?? item._id) === editingProductId ? { ...item, ...savedProduct, id: editingProductId } : item)))
    } else {
      savedProduct = await createProduct(payload)
      setProducts((prev) => [{ ...savedProduct, id: savedProduct.id ?? payload.id }, ...prev])
    }

    setProductModalOpen(false)
    setProductForm(emptyProductForm)
    setEditingProductId(null)
  }

  const handleDeleteCategory = async (id) => {
    const shouldDelete = confirmDestructiveAction('¿Eliminar esta categoría y quitarla del catálogo?')
    if (!shouldDelete) return

    const result = await deleteCategory(id)
    if (result?.ok === false) return
    setCategories((prev) => prev.filter((item) => (item.id ?? item._id) !== id))
    showToast('Categoría eliminada', 'Se retiró la categoría del catálogo.', '🗑️')
  }

  const handleCategorySubmit = async (event) => {
    event.preventDefault()

    const payload = {
      name: categoryForm.name.trim() || 'Nueva categoría',
      description: categoryForm.description.trim(),
      status: categoryForm.status || 'Activa',
    }

    let savedCategory
    if (editingCategoryId) {
      savedCategory = await updateCategory(editingCategoryId, payload)
      setCategories((prev) => prev.map((item) => ((item.id ?? item._id) === editingCategoryId ? { ...item, ...savedCategory, statusTone: savedCategory.status === 'Pausada' ? 'warning' : 'success' } : item)))
    } else {
      savedCategory = await createCategory(payload)
      setCategories((prev) => [{ ...savedCategory, products: savedCategory.products || 0, revenue: savedCategory.revenue || '$0', statusTone: savedCategory.status === 'Pausada' ? 'warning' : 'success' }, ...prev])
    }

    setCategoryModalOpen(false)
    setCategoryForm(emptyCategoryForm)
    setEditingCategoryId(null)
  }

  const handleSearchChange = (value) => {
    setSearches((prev) => ({ ...prev, [activeModule]: value }))
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
        <div className="max-w-md rounded-[2rem] border border-white/70 bg-white/70 p-8 text-center shadow-[0_20px_60px_rgba(104,80,111,0.12)] backdrop-blur-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-glowe-pink-accent">Acceso</p>
          <h1 className="mt-3 font-serif text-2xl font-bold text-glowe-dark">Acceso restringido</h1>
          <p className="mt-3 text-sm text-glowe-muted">Esta vista solo está disponible para administradores.</p>
        </div>
      </div>
    )
  }

  const renderModuleContent = () => {
    if (!moduleReady) {
      return (
        <div className="flex min-h-[420px] items-center justify-center">
          <div className="flex flex-col items-center gap-3 rounded-[2rem] border border-white/70 bg-white/70 px-8 py-6 shadow-xl backdrop-blur-md">
            <Orbit size={34} color="#ff758f" speed={1.4} />
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-glowe-muted">Cargando panel</span>
          </div>
        </div>
      )
    }
    if (activeModule === 'dashboard') {
      const todayLabel = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
      const todayLabelCap = todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1)
      return (
        <>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-glowe-pink-accent">{todayLabelCap}</p>
              <h1 className="mt-2 font-serif text-3xl font-bold text-glowe-dark md:text-4xl">Buenos días, {user.name?.split(' ')[0] || 'María'} <span aria-hidden="true">✦</span></h1>
              <p className="mt-2 text-sm text-glowe-muted">Panel administrativo puro de Glowe Beauty.</p>
            </div>
            <Button variant="glass" className="h-12 rounded-full px-5 shadow-sm" onClick={() => exportCurrentTable('pdf')}>Exportar reporte</Button>
          </div>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Ventas totales', value: formatCOP(summary.revenue), change: '+12.5%', tone: 'bg-pink-100 text-pink-700' },
              { label: 'Pedidos hoy', value: String(summary.todayOrders), change: '+8.2%', tone: 'bg-amber-100 text-amber-700' },
              { label: 'Clientes únicos', value: String(summary.newCustomers), change: '+18.7%', tone: 'bg-sky-100 text-sky-700' },
              { label: 'Stock crítico', value: String(summary.lowStock), change: '-4.3%', tone: 'bg-violet-100 text-violet-700' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-[1.6rem] border border-white/70 bg-white/75 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className={`rounded-2xl px-2.5 py-2 text-lg ${stat.tone}`}>{stat.label === 'Ventas totales' ? '↗' : stat.label === 'Pedidos hoy' ? '◌' : stat.label === 'Clientes únicos' ? '◎' : '▣'}</div>
                  <span className="text-xs font-bold text-emerald-600">{stat.change}</span>
                </div>
                <p className="mt-4 text-sm text-glowe-muted">{stat.label}</p>
                <p className="mt-2 font-serif text-3xl font-bold text-glowe-dark">{stat.value}</p>
              </div>
            ))}
          </section>

          <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
            <section className="rounded-[1.8rem] border border-white/70 bg-white/70 p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-glowe-dark">Rendimiento de ventas</h2>
                  <p className="text-sm text-glowe-muted">Ingresos generados en los últimos 7 días</p>
                </div>
                <div className="rounded-full bg-pink-50 px-3 py-1 text-sm font-bold text-glowe-pink-accent">{formatCOP(last7Days.total7d)}</div>
              </div>
              {last7Days.total7d > 0 ? (
                <div className="h-56 rounded-[1.5rem] bg-gradient-to-b from-pink-50 via-white to-sky-50 p-4">
                  <div className="flex h-full items-end justify-between gap-2">
                    {last7Days.values.map((day) => (
                      <div key={day.key} className="flex flex-1 flex-col items-center justify-end gap-2" title={`${day.label}: ${formatCOP(day.total)}`}>
                        <div className="w-full rounded-t-[1.2rem] bg-gradient-to-t from-glowe-pink-accent to-glowe-blue-accent" style={{ height: `${day.height}%` }} />
                        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-glowe-muted">{day.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-56 items-center justify-center rounded-[1.5rem] bg-gradient-to-b from-pink-50 via-white to-sky-50 p-4">
                  <p className="text-sm text-glowe-muted">Sin ventas registradas en los últimos 7 días.</p>
                </div>
              )}
            </section>

            <section className="rounded-[1.8rem] border border-white/70 bg-white/70 p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-glowe-dark">Pedidos recientes</h2>
                  <p className="text-sm text-glowe-muted">Últimos movimientos</p>
                </div>
                <button type="button" className="text-sm font-semibold text-glowe-pink-accent">Ver todos</button>
              </div>
              <div className="space-y-3">
                {purchases.length === 0 ? (
                  <p className="text-sm text-glowe-muted">Todavía no hay pedidos registrados.</p>
                ) : (
                  purchases.slice(0, 4).map((order, index) => (
                    <div key={order.id || order.orderId || `${order.customer}-${order.total}`} className="flex items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white/70 p-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-glowe-pink to-glowe-blue text-[10px] font-black text-white">{(order.customer || 'G').slice(0, 2).toUpperCase()}</div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-glowe-dark">{order.customer || 'Cliente Glowe'}</p>
                          <p className="text-[10px] uppercase tracking-[0.16em] text-glowe-muted">{order.status || 'Completado'}</p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-glowe-dark">{formatCOP(order.total || 0)}</p>
                        <p className="text-[10px] text-glowe-muted">{formatId(index + 1, 'Pedido #')}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </>
      )
    }

    return (
      <DataTable
        title={moduleMeta[activeModule].title}
        rows={currentModuleRows}
        columns={currentModuleColumns}
        searchValue={currentSearch}
        onSearchChange={handleSearchChange}
        primaryActionLabel={
          activeModule === 'categories'
            ? '+ Nueva categoría'
            : activeModule === 'products'
              ? '+ Crear producto'
              : activeModule === 'orders'
                ? '+ Crear compra'
                : activeModule === 'payments'
                  ? '+ Registrar abono'
                  : '+ Crear usuario'
        }
        onPrimaryAction={moduleMeta[activeModule].action}
        onExportPdf={() => exportCurrentTable('pdf')}
        onExportExcel={() => exportCurrentTable('excel')}
      />
    )
  }

  return (
    <div ref={panelRef} className="relative z-10 px-3 py-4 sm:px-4 sm:py-6 md:px-8 md:py-8">
      <div className="admin-module-card mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/65 bg-white/60 shadow-[0_25px_80px_rgba(95,72,111,0.08)] backdrop-blur-xl">
        <div className="flex min-h-[860px] flex-col xl:flex-row">
          <aside className={`flex w-full flex-col border-b border-white/60 bg-white/65 p-4 backdrop-blur-xl xl:w-[260px] xl:border-b-0 xl:border-r ${mobileMenuOpen ? 'block' : 'hidden xl:block'}`}>
            <div className="flex items-center justify-between gap-3 pb-6">
              <div className="flex items-center gap-3">
                <GloweeLogo />
                <div>
                  <p className="font-serif text-xl font-bold tracking-tight text-glowe-dark">Glowee</p>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-glowe-muted">beauty</p>
                </div>
              </div>
              <button type="button" onClick={() => setMobileMenuOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/60 text-sm text-glowe-dark xl:hidden" aria-label="Cerrar menú">✕</button>
            </div>

            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.24em] text-glowe-muted">Menú principal</p>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveModule(item.id)
                    setMobileMenuOpen(false)
                  }}
                  className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-medium transition-all ${
                    activeModule === item.id ? 'bg-gradient-to-r from-glowe-pink/20 to-glowe-blue/15 text-glowe-dark shadow-sm ring-1 ring-white/70' : 'text-glowe-muted hover:bg-white/60 hover:text-glowe-dark'
                  }`}
                >
                  <span className="flex items-center gap-3"><span className="text-base">{item.emoji}</span>{item.label}</span>
                  <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-glowe-pink-accent">
                    {item.id === 'dashboard' ? '•' : item.id === 'categories' ? categories.length : item.id === 'products' ? products.length : item.id === 'orders' ? purchases.length : users.length}
                  </span>
                </button>
              ))}
            </nav>

            <div className="mt-auto pt-6">
              <div className="flex items-center justify-between rounded-[1.5rem] border border-white/80 bg-white/60 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-glowe-pink to-glowe-blue text-xs font-black text-white">{(user.name || 'MG').slice(0, 2).toUpperCase()}</div>
                  <div>
                    <p className="text-sm font-bold text-glowe-dark">{user.name}</p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-glowe-muted">Admin principal</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <section className="flex-1 bg-[radial-gradient(circle_at_top_left,_rgba(255,176,201,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(140,229,247,0.14),transparent_35%)]">
            <header className="flex flex-col gap-4 border-b border-white/60 bg-white/35 px-4 py-4 backdrop-blur-sm md:px-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setMobileMenuOpen(true)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/70 text-glowe-dark xl:hidden" aria-label="Abrir menú">☰</button>
                <div className="min-w-0 truncate text-xs font-semibold uppercase tracking-[0.16em] text-glowe-muted sm:tracking-[0.22em]">Workspace <span className="text-glowe-pink-accent">/</span> {moduleMeta[activeModule].title}</div>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <button type="button" className="rounded-full border border-white/80 bg-white/70 p-2.5 text-base text-glowe-dark shadow-sm" aria-label="Notificaciones">🔔</button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowAccountMenu((prev) => !prev)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-glowe-pink to-glowe-blue text-xs font-black text-white shadow-sm transition hover:scale-[1.02]"
                    aria-label="Abrir menú de cuenta"
                  >
                    {(user.name || 'MG').slice(0, 2).toUpperCase()}
                  </button>

                  {showAccountMenu && (
                    <div className="absolute right-0 z-20 mt-3 w-52 overflow-hidden rounded-[1.25rem] border border-white/80 bg-white/95 p-2 shadow-[0_20px_40px_rgba(50,34,60,0.15)] backdrop-blur-xl">
                      <div className="px-3 py-2">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-glowe-muted">Cuenta</p>
                        <p className="mt-1 text-sm font-semibold text-glowe-dark">{user.name}</p>
                        <p className="text-xs text-glowe-muted">{user.email}</p>
                      </div>
                      <button type="button" onClick={() => setShowAccountMenu(false)} className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium text-glowe-dark transition hover:bg-pink-50">
                        <span>Perfil</span>
                        <span aria-hidden="true">→</span>
                      </button>
                      <button type="button" onClick={() => setShowAccountMenu(false)} className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium text-glowe-dark transition hover:bg-sky-50">
                        <span>Configuración</span>
                        <span aria-hidden="true">⚙</span>
                      </button>
                      <button type="button" onClick={handleLogout} className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50">
                        <span>Cerrar sesión</span>
                        <span aria-hidden="true">↗</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            <div className="space-y-6 px-4 py-6 md:px-6 md:py-8">{renderModuleContent()}</div>
          </section>
        </div>
      </div>

      <AdminModal isOpen={productModalOpen} onClose={() => setProductModalOpen(false)} title={editingProductId ? 'Editar producto' : 'Crear producto'}>
        <form onSubmit={handleProductSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">Nombre</label>
              <Input name="name" value={productForm.name} onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Nombre del producto" className="w-full" />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">Categoría</label>
              <select value={productForm.category} onChange={(event) => setProductForm((prev) => ({ ...prev, category: event.target.value }))} className="glass-input h-11 rounded-full px-4">
                <option value="maquillaje">Maquillaje</option>
                <option value="cabello">Cabello</option>
                <option value="skincare">Skincare</option>
                <option value="labios">Labios</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">Badge</label>
              <Input value={productForm.badge} onChange={(event) => setProductForm((prev) => ({ ...prev, badge: event.target.value }))} placeholder="Nuevo" className="w-full" />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">Precio</label>
              <Input type="number" min="0" value={productForm.price} onChange={(event) => setProductForm((prev) => ({ ...prev, price: event.target.value }))} placeholder="38000" className="w-full" />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">Stock</label>
              <Input type="number" min="0" value={productForm.stock} onChange={(event) => setProductForm((prev) => ({ ...prev, stock: event.target.value }))} className="w-full" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">Imagen</label>
              <Input value={productForm.image} onChange={(event) => setProductForm((prev) => ({ ...prev, image: event.target.value }))} placeholder="URL de la imagen" className="w-full" />
            </div>
            <div className="md:col-span-2 flex items-center gap-3 rounded-[1.2rem] border border-white/80 bg-white/70 px-4 py-3">
              <input
                id="product-is-recommended"
                type="checkbox"
                checked={Boolean(productForm.isRecommended)}
                onChange={(event) => setProductForm((prev) => ({ ...prev, isRecommended: event.target.checked }))}
                className="h-4 w-4 rounded border-glowe-pink-accent text-glowe-pink-accent focus:ring-glowe-pink-accent"
              />
              <label htmlFor="product-is-recommended" className="text-sm font-semibold text-glowe-dark">
                Mostrar como recomendado cuando el carrito esté vacío
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">Orden recomendado</label>
              <Input type="number" min="0" value={productForm.recommendedOrder} onChange={(event) => setProductForm((prev) => ({ ...prev, recommendedOrder: event.target.value }))} placeholder="0" className="w-full" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">Descripción</label>
              <textarea value={productForm.desc} onChange={(event) => setProductForm((prev) => ({ ...prev, desc: event.target.value }))} rows="4" className="glass-input min-h-[120px] rounded-[1.5rem] px-4 py-3 text-sm text-glowe-dark placeholder:text-glowe-muted" placeholder="Describe el beneficio principal del producto" />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="glass" fullWidth type="button" onClick={() => setProductModalOpen(false)} className="sm:w-auto">Cancelar</Button>
            <Button variant="gradient" fullWidth type="submit" className="sm:w-auto">{editingProductId ? 'Guardar cambios' : 'Crear producto'}</Button>
          </div>
        </form>
      </AdminModal>

      <AdminModal isOpen={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} title={editingCategoryId ? 'Editar categoría' : 'Crear categoría'}>
        <form onSubmit={handleCategorySubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">Nombre</label>
              <Input value={categoryForm.name} onChange={(event) => setCategoryForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Ej. Maquillaje" className="w-full" />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">Descripción</label>
              <textarea value={categoryForm.description} onChange={(event) => setCategoryForm((prev) => ({ ...prev, description: event.target.value }))} rows="3" className="glass-input min-h-[100px] rounded-[1.5rem] px-4 py-3 text-sm text-glowe-dark placeholder:text-glowe-muted" placeholder="Describe la categoría" />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">Estado</label>
              <select value={categoryForm.status} onChange={(event) => setCategoryForm((prev) => ({ ...prev, status: event.target.value }))} className="glass-input h-11 rounded-full px-4">
                <option value="Activa">Activa</option>
                <option value="Pausada">Pausada</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="glass" fullWidth type="button" onClick={() => setCategoryModalOpen(false)} className="sm:w-auto">Cancelar</Button>
            <Button variant="gradient" fullWidth type="submit" className="sm:w-auto">{editingCategoryId ? 'Guardar cambios' : 'Crear categoría'}</Button>
          </div>
        </form>
      </AdminModal>
    </div>
  )
}
