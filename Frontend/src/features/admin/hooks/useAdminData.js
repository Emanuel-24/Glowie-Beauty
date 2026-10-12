import { useEffect, useMemo, useState } from 'react'
import { getProducts } from '@/features/products/services/productService'
import { getCategories } from '@/features/products/services/categoryService'
import { getUsers } from '@/features/admin/services/userService'
import { getOrders } from '@/features/orders/services/orderService'
import { getPayments } from '@/features/admin/services/paymentService'
import { getTags } from '@/features/products/services/tagService'
import { getBundles } from '@/features/promotions/services/bundleService'
import { getSiteConfig, defaultSiteConfig } from '@/features/home/services/siteConfigService'
import { exportReport } from '@/features/admin/services/reportService'
import { formatCOP } from '@/features/admin/constants'
import {
  calculateAvailableYears,
  filterPurchasesByPeriod,
  calculateDashboardSummary,
  calculateSalesChart,
  calculateLast7DaysActivity,
} from '@/features/admin/utils/adminMetrics'

export function useAdminData() {
  const [products, setProducts] = useState([])
  const [moduleReady, setModuleReady] = useState(false)
  const [categories, setCategories] = useState([])
  const [users, setUsers] = useState([])
  const [purchases, setPurchases] = useState([])
  const [payments, setPayments] = useState([])
  const [tags, setTags] = useState([])
  const [bundles, setBundles] = useState([])
  const [siteConfigData, setSiteConfigData] = useState(defaultSiteConfig)
  const [searches, setSearches] = useState({
    dashboard: '',
    categories: '',
    products: '',
    incomingOrders: '',
    orders: '',
    payments: '',
    users: '',
    offers: '',
    tags: '',
    bundles: '',
    roles: '',
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
      getBundles(),
    ])
      .then(([items, categoryItems, orderItems, userItems, paymentItems, tagItems, configItem, bundleItems]) => {
        if (!active) return

        if (tagItems.status === 'fulfilled' && Array.isArray(tagItems.value)) {
          setTags(tagItems.value)
        } else {
          setTags([])
        }

        if (configItem.status === 'fulfilled' && configItem.value) {
          setSiteConfigData(configItem.value)
        }

        if (bundleItems.status === 'fulfilled' && Array.isArray(bundleItems.value)) {
          setBundles(bundleItems.value)
        } else {
          setBundles([])
        }

        if (items.status === 'fulfilled' && Array.isArray(items.value)) {
          setProducts(
            items.value.map((item, index) => ({
              id: item.id ?? item._id ?? index + 1,
              name: item.name || `Producto ${index + 1}`,
              brand: item.brand || 'Glowe Select',
              category: item.category || 'maquillaje',
              price: Number(item.price ?? 0),
              costPrice: Number(item.costPrice ?? 0),
              oldPrice: item.oldPrice != null ? Number(item.oldPrice) : null,
              stock: Number(item.stock ?? 0),
              image: item.image || item.images?.[0] || '',
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
        } else {
          setProducts([])
        }

        if (categoryItems.status === 'fulfilled' && Array.isArray(categoryItems.value)) {
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
        } else {
          setCategories([])
        }

        if (orderItems.status === 'fulfilled' && Array.isArray(orderItems.value)) {
          setPurchases(
            orderItems.value.map((item, index) => {
              const createdAt = item.createdAt ? new Date(item.createdAt) : new Date()
              return {
                id: item.id ?? item._id ?? index + 1,
                invoice: item.invoice || `FAC-${String(index + 1).padStart(4, '0')}`,
                date: item.createdAt ? createdAt.toLocaleDateString('es-CO') : 'Hoy',
                createdAt,
                customer: item.customer || 'Cliente Glowe',
                customerPhone: item.customerPhone || item.phone || '',
                customerEmail: item.customerEmail || item.email || '',
                customerCedula: item.customerCedula || item.cedula || '',
                customerCity: item.customerCity || item.city || '',
                customerDepartment: item.customerDepartment || item.department || '',
                total: Number(item.total ?? 0),
                subtotal: Number(item.subtotal ?? item.total ?? 0),
                shippingCost: Number(item.shippingCost ?? 0),
                paymentMethod: item.paymentMethod || 'contra_entrega',
                notes: item.notes || '',
                status: item.status || 'Pendiente',
                statusTone: item.status === 'Completada' ? 'success' : item.status === 'Anulada' ? 'danger' : item.status === 'Confirmada' ? 'info' : 'warning',
                items: Array.isArray(item.items) ? item.items : [],
                shippingAddress: item.shippingAddress || 'No especificada',
              }
            }),
          )
        } else {
          setPurchases([])
        }

        if (userItems.status === 'fulfilled' && Array.isArray(userItems.value)) {
          setUsers(
            userItems.value.map((item, index) => {
              const roleNormalized =
                item.role === 'admin'
                  ? 'Admin'
                  : item.role === 'editor'
                    ? 'Editor'
                    : item.role === 'soporte'
                      ? 'Soporte'
                      : 'Cliente'

              return {
                id: item.id ?? item._id ?? index + 1,
                name: item.name || 'Usuario Glowe',
                email: item.email || 'usuario@glowe.com',
                role: roleNormalized,
                rawRole: item.role || 'user',
                status: item.status || 'Activo',
                lastLoginAt: item.lastLoginAt || null,
                createdAt: item.createdAt || null,
              }
            }),
          )
        } else {
          setUsers([])
        }

        if (paymentItems.status === 'fulfilled' && Array.isArray(paymentItems.value)) {
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
          window.setTimeout(() => setModuleReady(true), 250)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const [selectedYear, setSelectedYear] = useState(() => String(new Date().getFullYear()))
  const [selectedMonth, setSelectedMonth] = useState('all')

  const availableYears = useMemo(() => calculateAvailableYears(purchases), [purchases])
  const filteredPurchases = useMemo(
    () => filterPurchasesByPeriod(purchases, selectedYear, selectedMonth),
    [purchases, selectedYear, selectedMonth],
  )
  const summary = useMemo(() => calculateDashboardSummary(filteredPurchases, products), [filteredPurchases, products])
  const salesChartData = useMemo(() => calculateSalesChart(purchases, selectedYear, selectedMonth), [purchases, selectedYear, selectedMonth])
  const last7Days = useMemo(() => calculateLast7DaysActivity(purchases), [purchases])

  const handleSearchChange = (moduleKey, value) => {
    setSearches((prev) => ({ ...prev, [moduleKey]: value }))
  }

  const exportDashboard = async ({ startDate = '', endDate = '', format = 'pdf' } = {}) => {
    let source = purchases
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : null
      const end = endDate ? new Date(endDate) : null
      if (end) end.setHours(23, 59, 59, 999)

      source = purchases.filter((o) => {
        const d = o.createdAt ? new Date(o.createdAt) : null
        if (!d) return true
        if (start && d < start) return false
        if (end && d > end) return false
        return true
      })
    }

    const valid = source.filter((o) => String(o?.status || '').toLowerCase() !== 'anulada')
    const rev = valid.reduce((sum, o) => sum + Number(o?.total || 0), 0)
    const avg = valid.length > 0 ? Math.round(rev / valid.length) : 0

    const payload = [
      { Metrica: 'Ventas período', Valor: formatCOP(rev) },
      { Metrica: 'Pedidos registrados', Valor: String(source.length) },
      { Metrica: 'Ticket promedio', Valor: formatCOP(avg) },
      { Metrica: 'Filtro Año', Valor: selectedYear },
      { Metrica: 'Filtro Mes', Valor: selectedMonth === 'all' ? 'Todos' : String(Number(selectedMonth) + 1) },
      { Metrica: 'Fecha Desde', Valor: startDate || 'Inicio' },
      { Metrica: 'Fecha Hasta', Valor: endDate || 'Hoy' },
    ]

    await exportReport({
      title: `reporte-dashboard-${selectedYear}`,
      moduleTitle: 'Dashboard de Ventas',
      payload,
      format,
    })
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
    filteredPurchases,
    payments,
    setPayments,
    tags,
    setTags,
    bundles,
    setBundles,
    siteConfigData,
    setSiteConfigData,
    moduleReady,
    searches,
    handleSearchChange,
    summary,
    last7Days,
    salesChartData,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    availableYears,
    exportDashboard,
  }
}
