import { useEffect, useState } from 'react'
import HairCareSection from '../components/sections/HairCareSection'
import ProductGrid from '../components/sections/ProductGrid'
import { getProducts } from '../services/api'
import { usePageMeta } from '@/hooks'

export default function Cabello() {
  usePageMeta({
    title: 'Cuidado del Cabello',
    description: 'Serums, mascarillas y tratamientos para un cabello suave y brillante. Compra cuidado capilar online en Colombia.',
  })

  const [products, setProducts] = useState([])

  useEffect(() => {
    getProducts().then(setProducts).catch(console.error)
  }, [])

  return (
    <>
      <h1 className="sr-only">Cuidado del cabello: rutinas y productos</h1>
      <HairCareSection />
      <ProductGrid
        products={products}
        categoryLock="cabello"
        title="Rutinas para un cabello brillante 🩵"
        subtitle="Categoría: Cabello"
      />
    </>
  )
}
