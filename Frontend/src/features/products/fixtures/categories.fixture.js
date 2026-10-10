/**
 * Fixtures visuales y opciones estáticas de presentación para catálogo y secciones de producto.
 */

export const categories = [
  {
    id: 'maquillaje',
    icon: '💗',
    bg: 'bg-glowe-pink',
    name: 'MAQUILLAJE',
    sub: 'Labios, Ojos y Rostro',
    accent: 'text-glowe-pink-accent',
    border: 'border-b-glowe-pink-dark',
  },
  {
    id: 'cabello',
    icon: '🩵',
    bg: 'bg-glowe-blue',
    name: 'CABELLO',
    sub: 'Tratamientos y Aceites',
    accent: 'text-glowe-blue-accent',
    border: 'border-b-glowe-blue-dark',
  },
  {
    id: 'glow-deals',
    icon: '💛',
    bg: 'bg-glowe-yellow',
    name: 'OFERTAS',
    sub: 'Hasta 30% OFF',
    accent: 'text-amber-600',
    border: 'border-b-glowe-yellow-dark',
  },
  {
    id: 'favoritos',
    icon: '✨',
    bg: 'bg-rose-100',
    name: 'MÁS VENDIDOS',
    sub: 'Favoritos de la comunidad',
    accent: 'text-rose-500',
    border: 'border-b-rose-400',
  },
]

export const editorialCategories = [
  { icon: '👄', name: 'Labios', sub: 'Tintas & Gloss', tag: 'renovar', border: 'border-t-rose-300' },
  { icon: '✨', name: 'Rostro', sub: 'Bases & Sérums', tag: 'radiante', border: 'border-t-glowe-yellow-dark' },
  { icon: '👁️', name: 'Ojos', sub: 'Pestañinas & Sombra', tag: 'natural', border: 'border-t-orange-700/60' },
  { icon: '🌸', name: 'Rubor', sub: 'Líquidos & Crema', tag: 'radiante', border: 'border-t-glowe-pink' },
  { icon: '🎨', name: 'Bases', sub: 'Cobertura Ligera', tag: 'natural', border: 'border-t-glowe-blue-dark' },
  { icon: '👜', name: 'Accesorios', sub: 'Brochas & Cosmetiqueras', tag: 'regalo', border: 'border-t-orange-300/60' },
]

export const hairCards = [
  { icon: '🧴', name: 'Shampoo Soft', sub: 'Limpieza delicada' },
  { icon: '🥑', name: 'Mascarillas', sub: 'Reparación total' },
  { icon: '✨', name: 'Tratamientos', sub: 'Nutrición sin enjuague' },
  { icon: '☁️', name: 'Cremas de Peinar', sub: 'Control rizos & liso' },
  { icon: '💧', name: 'Aceites Capilares', sub: 'Brillo de seda' },
  { icon: '🌟', name: 'Sérums Glow', sub: 'Antifrizz 24/7' },
]

export const quizOptions = [
  {
    tag: 'natural',
    icon: '🌿',
    label: 'Look Natural',
    sub: 'Fresco & Ligero',
    title: 'Filtro: Look Natural',
    desc: 'Productos de textura ligera y tonos suaves.',
  },
  {
    tag: 'radiante',
    icon: '✨',
    label: 'Verme Radiante',
    sub: 'Brillo & Iluminación',
    title: 'Filtro: Verme Radiante',
    desc: 'Iluminación, tintas y sérums para dar brillo.',
  },
  {
    tag: 'cabello',
    icon: '💆‍♀️',
    label: 'Cuidar mi Cabello',
    sub: 'Hidratación & Brillo',
    title: 'Filtro: Cuidar mi Cabello',
    desc: 'Tratamientos, aceites y nutrición capilar.',
  },
  {
    tag: 'renovar',
    icon: '💄',
    label: 'Renovar Maquillaje',
    sub: 'Tendencias & Tonos',
    title: 'Filtro: Renovar Maquillaje',
    desc: 'Últimas tendencias y tonos estrella.',
  },
  {
    tag: 'economico',
    icon: '🏷️',
    label: 'Algo Económico',
    sub: 'Menos de $45.000',
    title: 'Filtro: Algo Económico',
    desc: 'Productos increíbles por menos de $45.000 COP.',
  },
  {
    tag: 'regalo',
    icon: '🎁',
    label: 'Un Regalo Especial',
    sub: 'Kits & Sets',
    title: 'Filtro: Para Regalo',
    desc: 'Kits especiales y productos en empaque deluxe.',
  },
]

export const socialPosts = [
  {
    user: '@sofia_glowe',
    image:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
  },
  {
    user: '@camila_beauty',
    image:
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=400&q=80',
  },
  {
    user: '@valentina_hair',
    image:
      'https://placehold.co/400x400/FDE2E4/FF758F?text=Glowe',
  },
  {
    user: '@mariana_style',
    image:
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80',
  },
]
