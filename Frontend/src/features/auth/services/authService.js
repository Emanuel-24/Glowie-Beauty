import { apiRequest } from '@/shared/api/httpClient'
import { setToken, clearToken } from '@/shared/api/tokenStorage'

export async function login(email, password) {
  try {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    const payload = response?.data ?? response ?? {}
    const user = payload.user ?? {
      id: payload.id ?? `u-${Date.now().toString(36)}`,
      name: payload.name || 'Cliente Glowe',
      email: String(email).trim().toLowerCase(),
      role: payload.role || 'user',
    }
    const token = payload.token ?? response?.token ?? null

    if (token) {
      setToken(token)
    }

    return {
      ok: true,
      user,
      token,
    }
  } catch (error) {
    return {
      ok: false,
      error: error?.message || 'No se pudo iniciar sesión en este momento.',
      status: error?.status ?? 0,
    }
  }
}

export async function register(payload = {}) {
  try {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    const base = response?.data ?? response ?? {}
    const user = base.user ?? {
      id: `u-${Date.now().toString(36)}`,
      name: payload.name || 'Cliente Glowe',
      email: String(payload.email || '').trim().toLowerCase(),
      role: 'user',
    }

    if (base.token || response?.token) {
      setToken(base.token || response.token)
    }

    return { ok: true, user, token: base.token || response?.token || null }
  } catch (error) {
    return {
      ok: false,
      error: error?.message || 'No se pudo completar el registro.',
      status: error?.status ?? 0,
    }
  }
}

export async function getProfile() {
  try {
    const response = await apiRequest('/auth/profile')
    const user = response?.user ?? response ?? null

    if (user) {
      return { ok: true, user }
    }

    return { ok: false, user: null, error: 'No hay perfil disponible.' }
  } catch (error) {
    return {
      ok: false,
      user: null,
      error: error?.message || 'No se pudo cargar el perfil.',
      status: error?.status ?? 0,
    }
  }
}

export const logoutAuth = () => {
  clearToken()
  return { ok: true }
}
