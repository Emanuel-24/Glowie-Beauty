import { TOKEN_KEY } from '@/shared/config/storageKeys'

/**
 * Almacenamiento seguro y atómico del token JWT de sesión para Glowe Beauty.
 * Fase 10: Claves legacy retiradas definitivamente.
 * Clave canónica única: TOKEN_KEY ('glowe:token:v1').
 */

export const getToken = () => {
  if (typeof window === 'undefined') return ''
  try {
    const raw = window.localStorage.getItem(TOKEN_KEY)
    if (!raw) return ''
    return raw.startsWith('Bearer ') ? raw.slice(7).trim() : raw.trim()
  } catch {
    return ''
  }
}

export const setToken = (token) => {
  if (typeof window === 'undefined') return
  try {
    if (token) {
      const clean = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim()
      window.localStorage.setItem(TOKEN_KEY, clean)
    } else {
      clearToken()
    }
  } catch {
    // ignorar excepciones de cuota o modo privado
  }
}

export const clearToken = () => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(TOKEN_KEY)
  } catch {
    // ignorar excepciones
  }
}

export const hasToken = () => Boolean(getToken())
