/**
 * Utilidades puras para cálculo de totales de carrito (FASE 7A).
 * Desacopladas de React y testeables de forma unitaria.
 */

export const FREE_SHIPPING_THRESHOLD = 150000
export const STANDARD_SHIPPING_COST = 12000

export function calculateItemCount(items = []) {
  if (!Array.isArray(items)) return 0
  return items.reduce((sum, item) => sum + (Number(item?.qty) || 0), 0)
}

export function calculateSubtotal(items = []) {
  if (!Array.isArray(items)) return 0
  return items.reduce((sum, item) => {
    const price = Number(item?.price) || 0
    const qty = Number(item?.qty) || 0
    return sum + price * qty
  }, 0)
}

export function calculateShippingCost(subtotal = 0) {
  if (subtotal <= 0) return 0
  return subtotal > FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST
}

export function calculateTotal(subtotal = 0, shippingCost = 0) {
  return subtotal + shippingCost
}

export function calculateCartTotals(items = []) {
  const itemCount = calculateItemCount(items)
  const subtotal = calculateSubtotal(items)
  const shippingCost = calculateShippingCost(subtotal)
  const total = calculateTotal(subtotal, shippingCost)

  return {
    itemCount,
    subtotal,
    shippingCost,
    total,
  }
}
