import BundlesSection from '@/features/promotions/components/BundlesSection'
import { usePageMeta } from '@/shared/hooks/usePageMeta'

export default function Combos() {
  usePageMeta({
    title: 'Combos y Kits de Belleza',
    description: 'Kits de maquillaje y cuidado capilar listos para regalar o estrenar, a un precio especial en GLOWE BEAUTY.',
  })

  return (
    <>
      <h1 className="sr-only">Combos y kits de belleza</h1>
      <BundlesSection />
    </>
  )
}
