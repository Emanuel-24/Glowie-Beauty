import { useEffect, useState } from 'react'
import EditorialMakeup from '@/features/products/components/EditorialMakeup'
import ProductGrid from '@/features/products/components/ProductGrid'
import { getProducts } from '@/features/products/services/productService'
import { usePageMeta } from '@/shared/hooks/usePageMeta'

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
