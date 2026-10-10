import { env } from '@/shared/config/env'
import { getToken } from './tokenStorage'

export class ApiError extends Error {
  constructor(param1, param2, param3) {
    let message
    let status
    let data

    if (typeof param1 === 'number') {
      status = param1
      message = typeof param2 === 'string' ? param2 : `Error HTTP ${status}`
      data = param3 !== undefined ? param3 : null
    } else {
      message = typeof param1 === 'string' ? param1 : 'Error de API'
      status = typeof param2 === 'number' ? param2 : 0
      data = param3 !== undefined ? param3 : null
    }

    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
    this.details = data
  }
}

let onUnauthorizedCallback = () => {}

export const setUnauthorizedHandler = (fn) => {
  onUnauthorizedCallback = typeof fn === 'function' ? fn : () => {}
}

export const getBaseUrl = () => env.API_URL

export const apiRequest = async (path, options = {}) => {
  const {
    method = 'GET',
    body,
    auth = true,
    signal,
    headers = {},
    ...restOptions
  } = options

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const requestHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    Accept: 'application/json, text/plain, */*',
    ...headers,
  }

  if (auth) {
    const token = getToken()
    if (token && !requestHeaders.Authorization && !requestHeaders.authorization) {
      const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim()
      requestHeaders.Authorization = `Bearer ${cleanToken}`
    }
  }

  const requestBody =
    body !== undefined && body !== null
      ? typeof body === 'string'
        ? body
        : JSON.stringify(body)
      : undefined

  try {
    const response = await fetch(`${env.API_URL}${normalizedPath}`, {
      method,
      headers: requestHeaders,
      body: requestBody,
      signal,
      ...restOptions,
    })

    const contentType = response.headers.get('content-type') || ''
    const payload = contentType.includes('application/json')
      ? await response.json()
      : response.status === 204
        ? null
        : await response.text()

    if (!response.ok || payload?.success === false) {
      const message =
        payload?.message ||
        payload?.error ||
        payload?.detail ||
        `HTTP ${response.status}`

      if (response.status === 401) {
        const isAuthAttempt =
          normalizedPath.includes('/auth/login') || normalizedPath.includes('/auth/register')
        if (!isAuthAttempt) {
          onUnauthorizedCallback()
        }
        throw new ApiError(message || 'Sesión expirada o sin permisos.', 401, payload)
      }

      if (response.status === 403) {
        throw new ApiError('No tienes permisos para ejecutar esta acción.', 403, payload)
      }

      if (response.status >= 500) {
        throw new ApiError('El servidor tuvo un error. Inténtalo más tarde.', response.status, payload)
      }

      throw new ApiError(message, response.status, payload)
    }

    return payload?.data !== undefined ? payload.data : payload
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    const message =
      error instanceof TypeError
        ? 'No se pudo conectar con el backend. Revisa la URL o la conexión.'
        : 'No se pudo completar la solicitud.'

    throw new ApiError(message, 0, { cause: error?.message || String(error) })
  }
}
