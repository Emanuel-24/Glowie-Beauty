import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { FAVORITES_KEY } from '@/shared/config/storageKeys'
import { useAuth } from '@/features/auth'

export const FavoritesContext = createContext(null)

const STORAGE_KEY = FAVORITES_KEY

const isValidId = (id) => typeof id === 'string' || typeof id === 'number'

const resolveId = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value) && 'id' in value
    ? value.id
    : value

const loadAnonymousFavorites = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? [...new Set(parsed.filter(isValidId))] : []
  } catch {
    return []
  }
}

export function FavoritesProvider({ children }) {
  const { user, isAuthenticated } = useAuth()

  // Si está autenticado, inicializa exclusivamente con los favoritos de su perfil en MongoDB;
  // de lo contrario, carga los favoritos locales de la sesión anónima.
  const [favorites, setFavorites] = useState(() => {
    if (user && Array.isArray(user.favorites)) {
      return [...new Set(user.favorites.filter(isValidId))]
    }
    return loadAnonymousFavorites()
  })

  // Sincronización de aislamiento estricto:
  // 1. Al loguearse/registrarse un usuario, se borran inmediatamente los favoritos del localStorage anónimo.
  // 2. La cuenta carga exclusivamente los favoritos guardados en su perfil de MongoDB.
  // 3. NO fusiona automáticamente los favoritos de la sesión anónima previa.
  useEffect(() => {
    if (isAuthenticated && user) {
      try {
        window.localStorage.removeItem(STORAGE_KEY)
      } catch {
        /* incognito/quota: ignorar */
      }
      const userFavs = Array.isArray(user.favorites)
        ? [...new Set(user.favorites.filter(isValidId))]
        : []
      setFavorites(userFavs)
    }
  }, [isAuthenticated, user])

  // Persistir en localStorage anónimo ÚNICAMENTE si no hay usuario autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
      } catch {
        /* incognito/cuota: no persiste, no rompe */
      }
    }
  }, [favorites, isAuthenticated])

  // Escuchar cierre de sesión para limpiar y reiniciar a lista vacía
  useEffect(() => {
    const handleLogout = () => {
      setFavorites([])
      try {
        window.localStorage.removeItem(STORAGE_KEY)
      } catch {
        /* incognito/cuota: ignorar */
      }
    }
    window.addEventListener('glowe:auth:logout', handleLogout)
    return () => {
      window.removeEventListener('glowe:auth:logout', handleLogout)
    }
  }, [])

  const toggleFavorite = useCallback((productId) => {
    const id = resolveId(productId)
    let nextValue

    setFavorites((prevFavorites) => {
      const hasFavorite = prevFavorites.includes(id)
      nextValue = !hasFavorite
      return hasFavorite
        ? prevFavorites.filter((favId) => favId !== id)
        : [...prevFavorites, id]
    })

    return nextValue
  }, [])

  const removeFavorite = useCallback((productId) => {
    const id = resolveId(productId)
    setFavorites((prev) => prev.filter((favId) => favId !== id))
  }, [])

  const isFavorite = useCallback(
    (productId) => favorites.includes(resolveId(productId)),
    [favorites],
  )

  const count = favorites.length

  const value = useMemo(
    () => ({ favorites, count, toggleFavorite, removeFavorite, isFavorite }),
    [favorites, count, toggleFavorite, removeFavorite, isFavorite],
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites debe usarse dentro de <FavoritesProvider>')
  return ctx
}
