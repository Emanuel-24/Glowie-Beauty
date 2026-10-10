import { useNavigate } from 'react-router-dom'
import { usePageMeta } from '@/shared/hooks/usePageMeta'

export default function NotFoundPage() {
  usePageMeta({
    title: 'Página no encontrada',
    description: 'La página que buscas no existe en GLOWE BEAUTY.',
    noindex: true,
  })
  const navigate = useNavigate()
  return (
    <section className="py-32 text-center px-4">
      <span className="text-6xl">🔍</span>
      <h1 className="font-serif text-3xl font-bold text-glowe-dark mt-4">Página no encontrada</h1>
      <p className="text-sm text-glowe-muted mt-2">Pero tu Glow sigue en casa 💖</p>
      <button
        onClick={() => navigate('/')}
        className="mt-6 px-8 py-3 rounded-full bg-glowe-pink-accent text-white font-bold text-xs shadow-md hover:bg-rose-500 transition-colors"
      >
        Volver al Inicio
      </button>
    </section>
  )
}
