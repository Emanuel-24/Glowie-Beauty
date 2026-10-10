import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  getProfile as fetchProfile,
  login as loginUser,
  register as registerUser,
} from '../services/authService'
import { clearAuthToken, setAuthToken } from '../services/api'
import { useCart } from './CartContext'

const AuthContext = createContext(null)
const STORAGE_KEY = 'glowe:user:v1'
const ORDERS_KEY = 'glowe:orders:v1'

export const resolveUserRoute = (user) => (user?.role === 'admin' ? '/admin' : '/')

const loadUser = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (parsed && typeof parsed === 'object' && typeof parsed.email === 'string') {
      if (parsed.token) {
        setAuthToken(parsed.token)
      }
      return parsed
    }
    return null
  } catch {
    return null
  }
}

const persistUser = (user) => {
  try {
    if (user) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* incognito/cuota: no persiste, no rompe */
  }
}

const loadOrders = () => {
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const persistOrders = (orders) => {
  try {
    if (orders.length > 0) window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
    else window.localStorage.removeItem(ORDERS_KEY)
  } catch {
    /* incognito/cuota: no persiste, no rompe */
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)
  const [orders, setOrders] = useState(loadOrders)
  const { clearCart } = useCart()

  useEffect(() => {
    persistUser(user)
  }, [user])

  useEffect(() => {
    persistOrders(orders)
  }, [orders])

  useEffect(() => {
    const handleUnauthorizedEvent = (event) => {
      const message = event.detail?.message || 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
      setUser(null)
      clearAuthToken()
      try {
        window.localStorage.removeItem(STORAGE_KEY)
        window.sessionStorage.setItem('glowe:auth:notice', message)
      } catch {}

      const currentPath = window.location.pathname
      if (currentPath !== '/login' && currentPath !== '/auth' && currentPath !== '/registro') {
        window.location.href = '/auth'
      }
    }

    window.addEventListener('glowe:auth:unauthorized', handleUnauthorizedEvent)
    return () => {
      window.removeEventListener('glowe:auth:unauthorized', handleUnauthorizedEvent)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    try {
      const result = await fetchProfile()
      if (result?.ok && result.user) {
        setUser((prev) => ({ ...result.user, token: prev?.token || '' }))
      }
      return result
    } catch {
      return { ok: false, user: null, error: 'No se pudo refrescar el perfil.' }
    }
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      const result = await loginUser(email, password)
      if (result?.ok && result.user) {
        const token = result.token || result.user.token || ''
        const userWithToken = { ...result.user, token }
        if (token) {
          setAuthToken(token)
        }
        setUser(userWithToken)
      }
      return result
    } catch (error) {
      return { ok: false, error: error?.message || 'No se pudo iniciar sesión.' }
    }
  }, [])

  const register = useCallback(async ({ name, email, password }) => {
    try {
      const result = await registerUser({ name, email, password })
      if (result?.ok && result.user) {
        const token = result.token || result.user.token || ''
        const userWithToken = { ...result.user, token }
        if (token) {
          setAuthToken(token)
        }
        setUser(userWithToken)
      }
      return result
    } catch (error) {
      return { ok: false, error: error?.message || 'No se pudo completar el registro.' }
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    clearAuthToken()
    clearCart()
  }, [clearCart])

  const addOrder = useCallback(async (order) => {
    setOrders((prev) => [order, ...prev])
    return { ok: true, order }
  }, [])

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, register, logout, orders, addOrder, refreshProfile }),
    [user, login, register, logout, orders, addOrder, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
