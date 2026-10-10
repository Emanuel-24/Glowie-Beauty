import { useEffect, useMemo, useState } from 'react'
import { getProducts } from '@/features/products/services/productService'
import { getCategories } from '@/features/products/services/categoryService'
import { getUsers } from '@/features/admin/services/userService'
import { getOrders } from '@/features/orders/services/orderService'
import { getPayments } from '@/features/admin/services/paymentService'
import { getTags } from '@/features/products/services/tagService'
import { getSiteConfig, defaultSiteConfig } from '@/features/home/services/siteConfigService'
import { exportToPdf } from '@/features/admin/services/reportService'
import {
  formatCOP,
  toDayKey,
  parseLocalDate,
  defaultProducts,
  defaultCategories,
  defaultUsers,
  defaultPurchases,
} from '@/features/admin/constants'

export function useAdminData() {
  const [products, setProducts] = useState(defaultProducts)
  const [moduleReady, setModuleReady] = useState(false)
  const [categories, setCategories] = useState(defaultCategories)
  const [users, setUsers] = useState(defaultUsers)
  const [purchases, setPurchases] = useState(defaultPurchases)
  const [payments, setPayments] = useState([])
  const [tags, setTags] = useState([])
  const [siteConfigData, setSiteConfigData] = useState(defaultSiteConfig)
  const [searches, setSearches] = useState({
    dashboard: '',
    categories: '',
    products: '',
    orders: '',
    payments: '',
    users: '',
    offers: '',
    tags: '',
  })

  useEffect(() => {
    let active = true
    setModuleReady(false)

    Promise.allSettled([
      getProducts(),
      getCategories(),
      getOrders(),
      getUsers(),
      getPayments(),
      getTags(),
      getSiteConfig(),
    ])
      .then(([items, categoryItems, orderItems, userItems, paymentItems, tagItems, configItem]) => {
        if (!active) return

        if (tagItems.status === 'fulfilled' && Array.isArray(tagItems.value)) {
          setTags(tagItems.value)
        }

        if (configItem.status === 'fulfilled' && configItem.value) {
          setSiteConfigData(configItem.value)
        }

        if (items.status === 'fulfilled' && Array.isArray(items.value) && items.value.length > 0) {
          setProducts(
            items.value.map((item, index) => ({
              id: item.id ?? item._id ?? index + 1,
              name: item.name || `Producto ${index + 1}`,
              brand: item.brand || 'Glowe Select',
              category: item.category || 'maquillaje',
              price: Number(item.price ?? 0),
              oldPrice: item.oldPrice != null ? Number(item.oldPrice) : null,
              stock: Number(item.stock ?? 0),
              image: item.image || item.images?.[0] || defaultProducts[0].image,
              badge: item.badge || 'Nuevo',
              desc: item.desc || item.description || 'Producto de la colección Glowe.',
              tags: Array.isArray(item.tags) ? item.tags : [],
              isRecommended: Boolean(item.isRecommended),
              recommendedOrder: Number(item.recommendedOrder ?? 0),
              isOffer: Boolean(item.isOffer || (item.oldPrice != null && Number(item.oldPrice) > Number(item.price))),
              discountPercentage: Number(item.discountPercentage ?? 0),
              offerStartDate: item.offerStartDate || null,
              offerEndDate: item.offerEndDate || null,
              isFeaturedOffer: Boolean(item.isFeaturedOffer),
            })),
          )
        }

        if (
          categoryItems.status === 'fulfilled' &&
          Array.isArray(categoryItems.value) &&
          categoryItems.value.length > 0
        ) {
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

  const summary = useMemo(() => {
    const todayKey = toDayKey(new Date())
    return {
      totalProducts: products.length,
      revenue: purchases.reduce((sum, order) => sum + Number(order?.total || 0), 0),
      todayOrders: purchases.filter((order) => toDayKey(order?.createdAt) === todayKey).length,
      newCustomers: new Set(
        purchases.map((order) => String(order?.customer || '').trim().toLowerCase()).filter(Boolean),
      ).size,
      lowStock: products.filter((item) => Number(item.stock || 0) < 10).length,
      pending: purchases.filter((order) => String(order?.status || '').toLowerCase() !== 'completada').length,
    }
  }, [purchases, products])

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

  const handleSearchChange = (moduleKey, value) => {
    setSearches((prev) => ({ ...prev, [moduleKey]: value }))
  }

  const exportDashboard = () => {
    const payload = [
      { Metrica: 'Ventas totales', Valor: formatCOP(summary.revenue) },
      { Metrica: 'Pedidos registrados', Valor: String(purchases.length) },
      { Metrica: 'Pedidos hoy', Valor: String(summary.todayOrders) },
      { Metrica: 'Clientes únicos', Valor: String(summary.newCustomers) },
      { Metrica: 'Ventas últimos 7 días', Valor: formatCOP(last7Days.total7d) },
      { Metrica: 'Productos en catálogo', Valor: String(summary.totalProducts) },
      { Metrica: 'Stock crítico', Valor: String(summary.lowStock) },
    ]
    exportToPdf({ title: 'reporte-dashboard', moduleTitle: 'Dashboard', payload })
  }

  return {
    products,
    setProducts,
    categories,
    setCategories,
    users,
    setUsers,
    purchases,
    setPurchases,
    payments,
    setPayments,
    tags,
    setTags,
    siteConfigData,
    setSiteConfigData,
    moduleReady,
    searches,
    handleSearchChange,
    summary,
    last7Days,
    exportDashboard,
  }
}
