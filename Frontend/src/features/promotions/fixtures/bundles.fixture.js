/**
 * Fixture temporal de combos y bundles para Glowe Beauty (FASE 5).
 * Aislado aquí hasta que el backend implemente el modelo y endpoints de /api/bundles.
 */

export const bundles = [
  {
    id: 'bundle-glow-starter',
    type: 'COMBO',
    productId: 6,
    productIds: [1, 3],
    image:
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
    badgeBg: 'bg-glowe-pink',
    badgeText: 'text-glowe-pink-accent',
    border: 'border-glowe-pink/60',
    label: 'TOP BUNDLE',
    name: 'Glow Starter Box',
    desc: 'Brillo labial + Rubor SunKissed + Cosmetiquera rosa.',
    oldPrice: 103000,
    price: 79000,
    btn: 'bg-glowe-pink-accent hover:bg-rose-500',
  },
  {
    id: 'bundle-hair-glow',
    type: 'COMBO',
    productId: 2,
    productIds: [2, 4],
    image:
      'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80',
    badgeBg: 'bg-glowe-blue',
    badgeText: 'text-glowe-blue-accent',
    border: 'border-glowe-blue/80',
    label: 'HAIR CARE',
    name: 'Hair Glow Kit',
    desc: 'Sérum de Argán + Mascarilla Nocturna Reparadora.',
    oldPrice: 94000,
    price: 74000,
    btn: 'bg-glowe-blue-accent hover:bg-teal-600',
  },
  {
    id: 'bundle-everyday',
    type: 'COMBO',
    productId: 5,
    productIds: [5, 8],
    image:
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
    badgeBg: 'bg-glowe-pink',
    badgeText: 'text-glowe-pink-accent',
    border: 'border-glowe-pink/60',
    label: 'EVERYDAY',
    name: 'Everyday Makeup Duo',
    desc: 'Tinta de mejillas + Pestañina Volume & Curl.',
    oldPrice: 67000,
    price: 52000,
    btn: 'bg-glowe-pink-accent hover:bg-rose-500',
  },
  {
    id: 'bundle-self-care',
    type: 'COMBO',
    productId: 7,
    productIds: [7, 5],
    image:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
    badgeBg: 'bg-glowe-yellow',
    badgeText: 'text-amber-800',
    border: 'border-glowe-yellow-dark/60',
    label: 'SELF CARE',
    name: 'Self Care Spa Set',
    desc: 'Aceite de Coco + Tintas de Labios + Diadema spa.',
    oldPrice: 116000,
    price: 88000,
    btn: 'bg-amber-500 hover:bg-amber-600',
  },
]
