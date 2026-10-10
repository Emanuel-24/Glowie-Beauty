import { useEffect, useState, useMemo, useCallback } from 'react'
import { getProducts } from '@/features/products/services/productService'

let cachedProducts = null

export function useProductSearch(active = true) {
  const [products, setProducts] = useState(cachedProducts || [])
  const [loading, setLoading] = useState(!cachedProducts && active)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')

  const load = useCallback(async () => {
    if (cachedProducts) {
      setProducts(cachedProducts)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getProducts()
      const list = Array.isArray(data) ? data : []
      cachedProducts = list
      setProducts(list)
    } catch (err) {
      console.error('Error al cargar productos para búsqueda:', err)
      setError(err?.message || 'Error de búsqueda')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (active && !cachedProducts) {
      load()
    }
  }, [active, load])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products.slice(0, 8)
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q)),
    )
  }, [products, query])

  return {
    products,
    loading,
    error,
    query,
    setQuery,
    results,
    reload: load,
  }
}

export default useProductSearch
