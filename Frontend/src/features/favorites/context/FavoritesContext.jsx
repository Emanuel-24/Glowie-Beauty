import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { FAVORITES_KEY } from '@/shared/config/storageKeys'

export const FavoritesContext = createContext(null)

const STORAGE_KEY = FAVORITES_KEY

const isValidId = (id) => typeof id === 'string' || typeof id === 'number'

const resolveId = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value) && 'id' in value
    ? value.id
    : value

const loadFavorites = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? [...new Set(parsed.filter(isValidId))] : []
  } catch {
    return []
  }
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(loadFavorites)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    } catch {
      /* incognito/cuota: no persiste, no rompe */
    }
  }, [favorites])

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
