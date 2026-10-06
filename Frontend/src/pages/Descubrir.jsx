import { useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ProductGrid from '../components/sections/ProductGrid'
import FindYourGlow from '../components/sections/FindYourGlow'
import { quizOptions } from '../data/products'
import { getProducts } from '../services/api'
import { usePageMeta } from '@/hooks'

export default function Descubrir() {
  usePageMeta({
    title: 'Descubre tu Glow',
    description: 'Encuentra el producto de maquillaje o cuidado capilar ideal para ti con nuestro catálogo completo.',
  })

  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const tag = searchParams.get('tag')
  const glowFilter = tag ? quizOptions.find((o) => o.tag === tag) ?? null : null

  useEffect(() => {
    getProducts().then(setProducts).catch(console.error)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [tag])

  const handleSelectFilter = (option) => {
    if (option) {
      setSearchParams({ tag: option.tag })
    } else {
      setSearchParams({})
    }
  }

  return (
    <>
      <h1 className="sr-only">Descubre tu Glow: catálogo de maquillaje y cuidado capilar</h1>
      <FindYourGlow glowFilter={glowFilter} onSelectFilter={handleSelectFilter} />
      <ProductGrid
        products={products}
        glowFilter={glowFilter}
        onResetFilter={() => handleSelectFilter(null)}
      />
    </>
  )
}
