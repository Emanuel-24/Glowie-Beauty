import { useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ProductGrid from '@/features/products/components/ProductGrid'
import FindYourGlow from '@/features/products/components/FindYourGlow'
import { quizOptions } from '@/features/products/fixtures/categories.fixture'
import { getProducts } from '@/features/products/services/productService'
import { usePageMeta } from '@/shared/hooks/usePageMeta'

export default function Descubrir() {
  usePageMeta({
    title: 'Descubre tu Glow',
    description: 'Encuentra el producto de maquillaje o cuidado capilar ideal para ti con nuestro catálogo completo.',
  })

  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])

  // Separación de filtros: Origen ("Maquillaje" o "Cabello") vs Secundario ("Descubrir")
  const explicitMaquillaje = searchParams.get('maquillaje') || searchParams.get('curaduria')
  const explicitCabello = searchParams.get('cabello')
  const explicitDescubrir = searchParams.get('descubrir')
  const legacyTag = searchParams.get('tag')

  let maquillajeParam = explicitMaquillaje || ''
  let cabelloParam = explicitCabello || ''
  let descubrirParam = explicitDescubrir || ''

  // Compatibilidad hacia atrás con enlaces legacy ?tag=...
  if (!explicitMaquillaje && !explicitCabello && !explicitDescubrir && legacyTag) {
    const isQuizOption = quizOptions.some((o) => o.tag.toLowerCase() === legacyTag.toLowerCase())
    if (isQuizOption) {
      descubrirParam = legacyTag
    } else {
      maquillajeParam = legacyTag
    }
  }

  const searchParam = searchParams.get('search') || ''

  // Filtro de experiencia de Descubrir (objeto quiz o fallback estructurado)
  const glowFilter = descubrirParam
    ? quizOptions.find((o) => o.tag.toLowerCase() === descubrirParam.toLowerCase()) ?? {
        tag: descubrirParam,
        label: descubrirParam.charAt(0).toUpperCase() + descubrirParam.slice(1),
        icon: '✨',
        title: `Filtro: ${descubrirParam}`,
        desc: `Productos seleccionados para ${descubrirParam}`,
      }
    : null

  useEffect(() => {
    getProducts().then(setProducts).catch(console.error)
  }, [])

  const handleSelectFilter = (option) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('tag') // Migración limpia de legacy tag
    nextParams.delete('curaduria') // Migración limpia de legacy param
    if (maquillajeParam && !nextParams.has('maquillaje')) {
      nextParams.set('maquillaje', maquillajeParam)
    }
    if (cabelloParam && !nextParams.has('cabello')) {
      nextParams.set('cabello', cabelloParam)
    }

    if (option) {
      const optionTag = typeof option === 'string' ? option : option.tag
      nextParams.set('descubrir', optionTag)
    } else {
      nextParams.delete('descubrir')
    }
    setSearchParams(nextParams)
  }

  const handleClearMaquillaje = () => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('maquillaje')
    nextParams.delete('curaduria')
    nextParams.delete('tag')
    setSearchParams(nextParams)
  }

  const handleClearCabello = () => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('cabello')
    setSearchParams(nextParams)
  }

  const handleClearDescubrir = () => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('descubrir')
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
        maquillajeTag={maquillajeParam}
        cabelloTag={cabelloParam}
        descubrirTag={descubrirParam}
        searchQuery={searchParam}
        enableSearch={true}
        onSearchChange={handleSearchChange}
        onClearMaquillaje={handleClearMaquillaje}
        onClearCabello={handleClearCabello}
        onClearDescubrir={handleClearDescubrir}
        onClearSearch={handleClearSearch}
        onResetFilter={handleResetAll}
      />
    </>
  )
}
