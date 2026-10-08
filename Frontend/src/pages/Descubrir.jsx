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
  const tagParam = searchParams.get('tag') || ''
  const searchParam = searchParams.get('search') || ''

  // Buscar coincidencia en quizOptions si coincide el tag
  const glowFilter = tagParam
    ? quizOptions.find((o) => o.tag.toLowerCase() === tagParam.toLowerCase()) ?? null
    : null

  useEffect(() => {
    getProducts().then(setProducts).catch(console.error)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [tagParam, searchParam])

  const handleSelectFilter = (option) => {
    const nextParams = new URLSearchParams(searchParams)
    if (option) {
      nextParams.set('tag', option.tag)
    } else {
      nextParams.delete('tag')
    }
    setSearchParams(nextParams)
  }

  const handleSearchChange = (val) => {
    const nextParams = new URLSearchParams(searchParams)
    if (val && val.trim()) {
      nextParams.set('search', val)
    } else {
      nextParams.delete('search')
    }
    setSearchParams(nextParams)
  }

  const handleClearTag = () => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('tag')
    setSearchParams(nextParams)
  }

  const handleClearSearch = () => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('search')
    setSearchParams(nextParams)
  }

  const handleResetAll = () => {
    setSearchParams({})
  }

  return (
    <>
      <h1 className="sr-only">Descubre tu Glow: catálogo de maquillaje y cuidado capilar</h1>
      <FindYourGlow glowFilter={glowFilter} onSelectFilter={handleSelectFilter} />
      <ProductGrid
        products={products}
        glowFilter={glowFilter}
        activeTag={tagParam}
        searchQuery={searchParam}
        enableSearch={true}
        onSearchChange={handleSearchChange}
        onClearTag={handleClearTag}
        onClearSearch={handleClearSearch}
        onResetFilter={handleResetAll}
      />
    </>
  )
}
