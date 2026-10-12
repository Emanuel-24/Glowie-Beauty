import { toDayKey } from '@/features/admin/constants'

export function calculateAvailableYears(purchases = []) {
  const current = new Date().getFullYear()
  const yearsSet = new Set([current, current - 1, current - 2, current - 3])
  purchases.forEach((p) => {
    const d = p.createdAt ? new Date(p.createdAt) : null
    if (d && !isNaN(d.getTime())) {
      yearsSet.add(d.getFullYear())
    }
  })
  return Array.from(yearsSet).sort((a, b) => b - a).map(String)
}

export function filterPurchasesByPeriod(purchases = [], selectedYear = '', selectedMonth = 'all') {
  return purchases.filter((order) => {
    const d = order.createdAt ? new Date(order.createdAt) : null
    if (!d || isNaN(d.getTime())) return true

    if (selectedYear && String(d.getFullYear()) !== String(selectedYear)) {
      return false
    }
    if (selectedMonth !== 'all' && String(d.getMonth()) !== String(selectedMonth)) {
      return false
    }
    return true
  })
}

export function calculateDashboardSummary(filteredPurchases = [], products = []) {
  const todayKey = toDayKey(new Date())
  const validPurchases = filteredPurchases.filter((o) => String(o?.status || '').toLowerCase() !== 'anulada')
  const completedPurchases = filteredPurchases.filter((o) => String(o?.status || '').toLowerCase() === 'completada')
  const pendingPurchases = filteredPurchases.filter((o) => {
    const st = String(o?.status || '').toLowerCase()
    return st !== 'completada' && st !== 'anulada'
  })
  const revenue = validPurchases.reduce((sum, order) => sum + Number(order?.total || 0), 0)
  const averageTicket = validPurchases.length > 0 ? Math.round(revenue / validPurchases.length) : 0
  const lowStockProducts = products.filter((item) => Number(item.stock ?? 0) <= 5)

  const productCostMap = new Map()
  products.forEach((p) => {
    if (p.id) productCostMap.set(String(p.id), Number(p.costPrice || 0))
    if (p.name) productCostMap.set(p.name.trim().toLowerCase(), Number(p.costPrice || 0))
  })

  // Ganancia Estimada: sum((precioVenta - precioCoste) * cant) + shippingCost
  const estimatedProfit = validPurchases.reduce((acc, order) => {
    const items = Array.isArray(order?.items) ? order.items : []
    const itemsMargin = items.reduce((subSum, it) => {
      const salePrice = Number(it.price || 0)
      const qty = Number(it.quantity ?? it.qty ?? 1)
      const rawCost = it.costPrice !== undefined
        ? Number(it.costPrice)
        : (productCostMap.get(String(it.productId || it.id)) ??
           productCostMap.get(String(it.title || it.name || '').trim().toLowerCase()) ??
           0)
      return subSum + (salePrice - rawCost) * qty
    }, 0)
    const shipping = Number(order?.shippingCost || 0)
    return acc + itemsMargin + shipping
  }, 0)

  return {
    totalProducts: products.length,
    revenue,
    todayOrders: filteredPurchases.filter((order) => toDayKey(order?.createdAt) === todayKey).length,
    newCustomers: new Set(
      filteredPurchases.map((order) => String(order?.customer || '').trim().toLowerCase()).filter(Boolean),
    ).size,
    lowStock: lowStockProducts.length,
    pending: pendingPurchases.length,
    completedOrders: completedPurchases.length,
    averageTicket,
    estimatedProfit,
    totalOrders: validPurchases.length,
  }
}

export function calculateSalesChart(purchases = [], selectedYear = '', selectedMonth = 'all') {
  const yr = parseInt(selectedYear, 10) || new Date().getFullYear()

  if (selectedMonth === 'all') {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const totals = new Array(12).fill(0)

    purchases.forEach((order) => {
      if (String(order?.status || '').toLowerCase() === 'anulada') return
      const d = order.createdAt ? new Date(order.createdAt) : null
      if (d && !isNaN(d.getTime()) && d.getFullYear() === yr) {
        totals[d.getMonth()] += Number(order.total || 0)
      }
    })

    const totalSales = totals.reduce((a, b) => a + b, 0)
    const maxVal = Math.max(1, ...totals)

    return {
      totalSales,
      values: months.map((label, index) => ({
        key: `m-${index}`,
        label,
        total: totals[index],
        height: Math.round((totals[index] / maxVal) * 100),
      })),
    }
  }

  const mo = parseInt(selectedMonth, 10)
  const daysInMonth = new Date(yr, mo + 1, 0).getDate()
  const weeksCount = Math.ceil(daysInMonth / 7)
  const weekTotals = new Array(weeksCount).fill(0)

  purchases.forEach((order) => {
    if (String(order?.status || '').toLowerCase() === 'anulada') return
    const d = order.createdAt ? new Date(order.createdAt) : null
    if (d && !isNaN(d.getTime()) && d.getFullYear() === yr && d.getMonth() === mo) {
      const dayOfMonth = d.getDate()
      const weekIdx = Math.min(Math.floor((dayOfMonth - 1) / 7), weeksCount - 1)
      weekTotals[weekIdx] += Number(order.total || 0)
    }
  })

  const totalSales = weekTotals.reduce((a, b) => a + b, 0)
  const maxVal = Math.max(1, ...weekTotals)

  return {
    totalSales,
    values: weekTotals.map((tot, idx) => ({
      key: `w-${idx}`,
      label: `Sem ${idx + 1}`,
      total: tot,
      height: Math.round((tot / maxVal) * 100),
    })),
  }
}

export function calculateLast7DaysActivity(purchases = []) {
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
}
