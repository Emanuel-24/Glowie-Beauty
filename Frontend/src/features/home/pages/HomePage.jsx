import HeroSection from '@/features/home/components/HeroSection'
import { CategoryPlayground } from '@/features/products'
import TrustBadges from '@/features/home/components/TrustBadges'
import SocialProof from '@/features/home/components/SocialProof'
import { usePageMeta } from '@/shared/hooks/usePageMeta'

export default function HomePage() {
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
