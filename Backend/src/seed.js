import dotenv from 'dotenv'

dotenv.config()

import connectDB from './config/db.js'
import Product from './models/Product.js'
import User from './models/User.js'
import Bundle from './models/Bundle.js'

const seedProducts = [
  {
    name: 'Brillo Labial HydraGlow Tint',
    brand: 'Trendy',
    category: 'maquillaje',
    tags: ['natural', 'radiante', 'renovar'],
    price: 38000,
    oldPrice: 48000,
    rating: 4.9,
    badge: 'Best Seller ✨',
    image:
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80',
    ],
    desc: 'Producto 100% original de Trendy, distribuido por Glowe Beauty. Hidratación profunda con color rosa natural de larga duración.',
    stock: 24,
    description: 'Producto 100% original de Trendy, distribuido por Glowe Beauty. Hidratación profunda con color rosa natural de larga duración.',
    isRecommended: true,
    recommendedOrder: 1,
  },
  {
    name: 'Sérum Capilar Argan & Seda',
    brand: 'Olaplex',
    category: 'cabello',
    tags: ['cabello', 'radiante'],
    price: 52000,
    oldPrice: null,
    rating: 4.8,
    badge: 'Top Rated 🩵',
    image: 'https://placehold.co/900x900/E0F7FA/1B9AAA?text=Serum+Argan',
    images: [
      'https://placehold.co/900x900/E0F7FA/1B9AAA?text=Serum+Argan',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80',
    ],
    desc: 'Producto 100% original garantizado por Glowe Beauty. Control antifrizz inmediato con toque de seda y aroma fresco.',
    stock: 18,
    description: 'Producto 100% original garantizado por Glowe Beauty. Control antifrizz inmediato con toque de seda y aroma fresco.',
    isRecommended: true,
    recommendedOrder: 2,
  },
  {
    name: 'Paleta Rubor & Iluminador SunKissed',
    brand: 'Montoc',
    category: 'maquillaje',
    tags: ['radiante', 'renovar', 'regalo'],
    price: 44000,
    oldPrice: 55000,
    rating: 5,
    badge: 'Nuevo 💛',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80',
    ],
    desc: 'Original de Montoc, distribuido por Glowe Beauty. Pigmentación sedosa con acabado luminoso y natural.',
    stock: 16,
    description: 'Original de Montoc, distribuido por Glowe Beauty. Pigmentación sedosa con acabado luminoso y natural.',
    isRecommended: true,
    recommendedOrder: 3,
  },
  {
    name: 'Mascarilla Reparación Nocturna HairCare',
    brand: 'Kaba',
    category: 'cabello',
    tags: ['cabello', 'economico'],
    price: 42000,
    oldPrice: null,
    rating: 4.7,
    badge: 'Favorito 🌸',
    image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80',
    ],
    desc: 'Tratamiento capilar Kaba distribuido por Glowe Beauty. Nutrición intensa mientras duermes para un cabello suave.',
    stock: 30,
    description: 'Tratamiento capilar Kaba distribuido por Glowe Beauty. Nutrición intensa mientras duermes para un cabello suave.',
  },
  {
    name: 'Tinta de Labios y Mejillas Everyday Pink',
    brand: 'Ame Cosméticos',
    category: 'maquillaje',
    tags: ['natural', 'economico'],
    price: 32000,
    oldPrice: 39000,
    rating: 4.9,
    badge: 'Económico 🏷️',
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80',
    ],
    desc: 'Producto original de Ame Cosméticos comercializado por Glowe Beauty. Doble uso para un look fresco en 2 minutos.',
    stock: 27,
    description: 'Producto original de Ame Cosméticos comercializado por Glowe Beauty. Doble uso para un look fresco en 2 minutos.',
  },
  {
    name: 'Kit Glow Starter Beauty Box',
    brand: 'Glowe Select',
    category: 'maquillaje',
    tags: ['regalo', 'radiante', 'renovar'],
    price: 89000,
    oldPrice: 110000,
    rating: 5,
    badge: 'Kit Regalo 🎁',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=80',
    ],
    desc: 'Curaduría especial de Glowe Beauty. Combina esenciales de marcas aliadas: brillo labial, rubor líquido y cosmetiquera pastel.',
    stock: 11,
    description: 'Curaduría especial de Glowe Beauty. Combina esenciales de marcas aliadas: brillo labial, rubor líquido y cosmetiquera pastel.',
  },
  {
    name: 'Aceite Nutritivo de Coco & Camelia',
    brand: "L'Oréal Paris",
    category: 'cabello',
    tags: ['cabello', 'natural'],
    price: 46000,
    oldPrice: null,
    rating: 4.8,
    badge: 'Cruelty Free 🌿',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80',
    ],
    desc: "Cuidado capilar L'Oréal Paris comercializado por Glowe Beauty. Protección térmica y nutrición para puntas secas.",
    stock: 21,
    description: "Cuidado capilar L'Oréal Paris comercializado por Glowe Beauty. Protección térmica y nutrición para puntas secas.",
  },
  {
    name: 'Máscara de Pestañas Volume & Curl',
    brand: 'Maybelline',
    category: 'maquillaje',
    tags: ['natural', 'renovar', 'economico'],
    price: 35000,
    oldPrice: 42000,
    rating: 4.9,
    badge: 'Efecto Elevación ✨',
    image: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=80',
    ],
    desc: 'Maybelline 100% original comercializado por Glowe Beauty. Definición sin grumos que resiste todo el día.',
    stock: 25,
    description: 'Maybelline 100% original comercializado por Glowe Beauty. Definición sin grumos que resiste todo el día.',
  },
]

const main = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI no está definido. Configúralo antes de ejecutar el seed.')
    process.exit(1)
  }

  await connectDB()

  await Product.deleteMany({})
  await User.deleteMany({})
  await Bundle.deleteMany({})

  const products = await Product.insertMany(seedProducts)
  await User.create({
    name: 'Admin Glowe',
    email: 'admin@glowe.com',
    password: 'admin123',
    role: 'admin',
  })

  // Sembrar combos enlazados con productos reales
  const p1 = products[0]?._id
  const p2 = products[1]?._id
  const p3 = products[2]?._id

  if (p1 && p2) {
    await Bundle.create([
      {
        name: 'Glow Starter Box',
        desc: 'Brillo labial HydraGlow + Sérum Capilar Argan.',
        price: 79000,
        oldPrice: 90000,
        badge: 'TOP BUNDLE',
        badgeBg: 'bg-glowe-pink',
        badgeText: 'text-glowe-pink-accent',
        border: 'border-glowe-pink/60',
        btn: 'bg-glowe-pink-accent hover:bg-rose-500',
        image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
        productIds: [p1, p2],
        isActive: true,
      },
      ...(p3
        ? [
            {
              name: 'Everyday Beauty Duo',
              desc: 'Brillo HydraGlow + Paleta Rubor SunKissed.',
              price: 68000,
              oldPrice: 82000,
              badge: 'EVERYDAY',
              badgeBg: 'bg-glowe-pink',
              badgeText: 'text-glowe-pink-accent',
              border: 'border-glowe-pink/60',
              btn: 'bg-glowe-pink-accent hover:bg-rose-500',
              image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
              productIds: [p1, p3],
              isActive: true,
            },
          ]
        : []),
    ])
  }

  console.log(`Seed completado: ${products.length} productos, combos y 1 admin creados.`)
  process.exit(0)
}

main().catch((error) => {
  console.error('Error ejecutando seed:', error)
  process.exit(1)
})
