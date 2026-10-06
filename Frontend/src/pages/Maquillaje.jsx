import { useEffect, useState } from 'react'
import EditorialMakeup from '../components/sections/EditorialMakeup'
import ProductGrid from '../components/sections/ProductGrid'
import { getProducts } from '../services/api'
import { usePageMeta } from '@/hooks'

export default function Maquillaje() {
  usePageMeta({
    title: 'Maquillaje',
    description: 'Labiales, rubores, iluminadores y más. Compra maquillaje online en Colombia con envío a todo el país.',
  })

  const [products, setProducts] = useState([])

  useEffect(() => {
    getProducts().then(setProducts).catch(console.error)
  }, [])

  return (
    <>
      <h1 className="sr-only">Maquillaje: productos y combos de belleza</h1>
      <EditorialMakeup />
      <ProductGrid
        products={products}
        categoryLock="maquillaje"
        title="Descubre tu combo maquillaje ✨"
        subtitle="Categoría: Maquillaje"
      />
    </>
  )
}
