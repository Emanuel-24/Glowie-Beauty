import { useEffect, useState, useCallback } from 'react'
import { getProducts } from '@/features/products/services/productService'

export function useProducts(options = {}) {
  const { category, tag, autoFetch = true } = options
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(autoFetch)
  const [error, setError] = useState(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getProducts()
      let filtered = Array.isArray(data) ? data : []

      if (category) {
        filtered = filtered.filter(
          (p) => p.category?.toLowerCase() === category.toLowerCase(),
        )
      }
      if (tag) {
        filtered = filtered.filter((p) => (p.tags || []).includes(tag))
      }

      setProducts(filtered)
    } catch (err) {
      console.error('Error al cargar productos:', err)
      setError(err?.message || 'Error al obtener productos')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [category, tag])

  useEffect(() => {
    if (autoFetch) {
      fetchProducts()
    }
  }, [autoFetch, fetchProducts])

  return {
    products,
    loading,
    error,
    reload: fetchProducts,
  }
}

export default useProducts
