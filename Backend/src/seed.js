import dotenv from 'dotenv'

dotenv.config()

import connectDB from './config/db.js'
import Product from './models/Product.js'
import User from './models/User.js'

const seedProducts = [
  {
    name: 'Brillo Labial HydraGlow Tint',
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
    desc: 'Hidratación profunda con color rosa natural de larga duración.',
    stock: 24,
    description: 'Hidratación profunda con color rosa natural de larga duración.',
    isRecommended: true,
    recommendedOrder: 1,
  },
  {
    name: 'Sérum Capilar Argan & Seda',
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
    desc: 'Control antifrizz inmediato con toque de seda y aroma fresco.',
    stock: 18,
    description: 'Control antifrizz inmediato con toque de seda y aroma fresco.',
    isRecommended: true,
    recommendedOrder: 2,
  },
  {
    name: 'Paleta Rubor & Iluminador SunKissed',
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
    desc: 'Pigmentación sedosa con acabado luminoso y natural.',
    stock: 16,
    description: 'Pigmentación sedosa con acabado luminoso y natural.',
    isRecommended: true,
    recommendedOrder: 3,
  },
  {
    name: 'Mascarilla Reparación Nocturna HairCare',
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
    desc: 'Nutrición intensa mientras duermes para un cabello suave.',
    stock: 30,
    description: 'Nutrición intensa mientras duermes para un cabello suave.',
  },
  {
    name: 'Tinta de Labios y Mejillas Everyday Pink',
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
    desc: 'Doble uso para un look fresco en 2 minutos.',
    stock: 27,
    description: 'Doble uso para un look fresco en 2 minutos.',
  },
  {
    name: 'Kit Glow Starter Beauty Box',
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
    desc: 'Incluye brillo labial, rubor líquido y cosmetiquera pastel.',
    stock: 11,
    description: 'Incluye brillo labial, rubor líquido y cosmetiquera pastel.',
  },
  {
    name: 'Aceite Nutritivo de Coco & Camelia',
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
    desc: 'Protección térmica y nutrición para puntas secas.',
    stock: 21,
    description: 'Protección térmica y nutrición para puntas secas.',
  },
  {
    name: 'Máscara de Pestañas Volume & Curl',
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
    desc: 'Definición sin grumos que resiste todo el día.',
    stock: 25,
    description: 'Definición sin grumos que resiste todo el día.',
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

  const products = await Product.insertMany(seedProducts)
  await User.create({
    name: 'Admin Glowe',
    email: 'admin@glowe.com',
    password: 'admin123',
    role: 'admin',
  })

  console.log(`Seed completado: ${products.length} productos y 1 admin creados.`)
  process.exit(0)
}

main().catch((error) => {
  console.error('Error ejecutando seed:', error)
  process.exit(1)
})
