import HeroSection from '../components/sections/HeroSection'
import CategoryPlayground from '../components/sections/CategoryPlayground'
import TrustBadges from '../components/sections/TrustBadges'
import SocialProof from '../components/sections/SocialProof'
import { usePageMeta } from '@/hooks'

export default function Inicio() {
  usePageMeta({
    title: 'Maquillaje y Cabello',
    description: 'Belleza que te hace brillar. Maquillaje, cuidado capilar, combos y ofertas con entrega en Colombia.',
  })

  return (
    <>
      <HeroSection />
      <CategoryPlayground />
      <TrustBadges />
      <SocialProof />
    </>
  )
}
