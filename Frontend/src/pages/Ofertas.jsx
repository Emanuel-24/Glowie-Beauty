import GlowDeals from '../components/sections/GlowDeals'
import { usePageMeta } from '@/hooks'

export default function Ofertas() {
  usePageMeta({
    title: 'Ofertas y Descuentos',
    description: 'Aprovecha las ofertas destacadas de GLOWE BEAUTY: maquillaje y cuidado capilar con descuentos por tiempo limitado.',
  })

  return (
    <>
      <h1 className="sr-only">Ofertas destacadas de maquillaje y cuidado capilar</h1>
      <GlowDeals />
    </>
  )
}
