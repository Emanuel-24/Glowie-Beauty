import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { CART_KEY } from '@/shared/config/storageKeys'
import { calculateCartTotals } from '@/features/cart/utils/cartTotals'

export const CartContext = createContext(null)
const STORAGE_KEY = CART_KEY

const resolveId = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value) && 'id' in value
    ? value.id
    : value

const loadCart = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed)
      ? parsed.filter(
          (i) =>
            i &&
            (typeof i.id === 'string' || typeof i.id === 'number') &&
            typeof i.qty === 'number' &&
            i.qty > 0 &&
            typeof i.price === 'number' &&
            i.price >= 0,
        )
      : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* incognito/quota: no persiste, no rompe */
    }
  }, [items])

  const clearCart = useCallback(() => {
    setItems([])
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* incognito/quota: no persiste, no rompe */
    }
  }, [])

  // Desacoplamiento de Auth: limpiar carrito reactivamente ante evento de logout
  useEffect(() => {
    const handleLogout = () => {
      clearCart()
    }
    window.addEventListener('glowe:auth:logout', handleLogout)
    return () => {
      window.removeEventListener('glowe:auth:logout', handleLogout)
    }
  }, [clearCart])

  const addItem = useCallback((product) => {
    if (!product || typeof product.id === 'undefined') return
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i))
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }, [])

  const removeItem = useCallback((id) => {
    const itemId = resolveId(id)
    setItems((prev) =>
      prev
        .map((i) => (i.id === itemId ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0),
    )
  }, [])

  const updateQuantity = useCallback((id, quantity) => {
    if (!Number.isInteger(quantity) || quantity < 1) return
    const itemId = resolveId(id)
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, qty: Math.min(quantity, 99) } : i)),
    )
  }, [])

  const setItemQty = useCallback((id, qty) => {
    const itemId = resolveId(id)
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.id !== itemId)
        : prev.map((i) => (i.id === itemId ? { ...i, qty: Math.min(qty, 99) } : i)),
    )
  }, [])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])
  const toggleCart = useCallback(() => setIsOpen((v) => !v), [])

  const { itemCount, subtotal, shippingCost, total } = useMemo(
    () => calculateCartTotals(items),
    [items],
  )

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      shippingCost,
      total,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      removeItem,
      updateQuantity,
      setItemQty,
      clearCart,
    }),
    [
      items,
      itemCount,
      subtotal,
      shippingCost,
      total,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      removeItem,
      updateQuantity,
      setItemQty,
      clearCart,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}
