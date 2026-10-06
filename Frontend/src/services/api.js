const DEFAULT_API_URL = 'http://localhost:5000/api'
const TOKEN_STORAGE_KEY = 'glowe:token:v1'

const apiUrl = (() => {
  const configured = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || DEFAULT_API_URL
  return String(configured).replace(/\/+$/, '')
})()

const readToken = () => {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

export const setAuthToken = (token) => {
  try {
    if (token) window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
    else window.localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {
    // ignore quota/private mode issues
  }
}

export const clearAuthToken = () => setAuthToken('')

export class ApiError extends Error {
  constructor(status, message, details = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export const getBaseUrl = () => apiUrl

export const apiRequest = async (path, options = {}) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const token = readToken()
  const requestHeaders = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${apiUrl}${normalizedPath}`, {
      ...options,
      headers: requestHeaders,
    })

    const contentType = response.headers.get('content-type') || ''
    const payload = contentType.includes('application/json')
      ? await response.json()
      : response.status === 204
        ? null
        : await response.text()

    if (!response.ok) {
      const message =
        payload?.message ||
        payload?.error ||
        payload?.detail ||
        `HTTP ${response.status}`

      if (response.status === 401) {
        throw new ApiError(401, 'Sesión expirada o sin permisos.', payload)
      }

      if (response.status === 403) {
        throw new ApiError(403, 'No tienes permisos para ejecutar esta acción.', payload)
      }

      if (response.status >= 500) {
        throw new ApiError(500, 'El servidor tuvo un error. Inténtalo más tarde.', payload)
      }

      throw new ApiError(response.status, message, payload)
    }

    return payload
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    const message = error instanceof TypeError
      ? 'No se pudo conectar con el backend. Revisa la URL o la conexión.'
      : 'No se pudo completar la solicitud.'

    throw new ApiError(0, message, { cause: error?.message || String(error) })
  }
}

export const getProducts = async () => {
  const { getProducts: getProductsService } = await import('./productService')
  return getProductsService()
}

export const getProductById = async (id) => {
  const { getProductById: getProductByIdService } = await import('./productService')
  return getProductByIdService(id)
}

export const login = async (email, password) => {
  const { login: loginService } = await import('./authService')
  return loginService(email, password)
}

export const register = async (payload) => {
  const { register: registerService } = await import('./authService')
  return registerService(payload)
}

export const getProfile = async () => {
  const { getProfile: getProfileService } = await import('./authService')
  return getProfileService()
}

export const createOrder = async (orderData) => {
  const { createOrder: createOrderService } = await import('./orderService')
  return createOrderService(orderData)
}

export const getOrders = async () => {
  const { getOrders: getOrdersService } = await import('./orderService')
  return getOrdersService()
}

export const getUserOrders = async () => {
  const { getUserOrders: getUserOrdersService } = await import('./orderService')
  return getUserOrdersService()
}

export const getUsers = async () => {
  const { getUsers: getUsersService } = await import('./userService')
  return getUsersService()
}

export const getGlowDeals = async () => {
  const { glowDeals, bundles } = await import('../data/products')
  const deals = glowDeals.filter((deal) => deal.isFeaturedOffer === true).slice(0, 3)
  return { deals, bundles }
}

export const getComboById = async (comboId) => {
  const { bundles, products } = await import('../data/products')
  const combo = bundles.find((bundle) => bundle.id === comboId && bundle.type === 'COMBO')
  if (!combo) return null

  const items = (combo.productIds || [])
    .map((productId) => products.find((product) => product.id === productId))
    .filter(Boolean)

  return { combo, items }
}

export const subscribeNewsletter = async (email) => {
  await new Promise((resolve) => setTimeout(resolve, 250))
  return { success: true, email, message: 'Suscripción registrada' }
}
