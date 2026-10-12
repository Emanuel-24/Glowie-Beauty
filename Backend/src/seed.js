import dotenv from 'dotenv'
dotenv.config()

import connectDB from './config/db.js'
import Product from './models/Product.js'
import User from './models/User.js'
import Bundle from './models/Bundle.js'
import Category from './models/Category.js'
import Tag from './models/Tag.js'
import Order from './models/Order.js'
import Payment from './models/Payment.js'
import { SEED_CATEGORIES, SEED_TAGS, SEED_PRODUCTS } from './data/seedData.js'

const main = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI no está definido. Configúralo antes de ejecutar el seed.')
    process.exit(1)
  }

  await connectDB()

  await Promise.all([
    Product.deleteMany({}),
    Category.deleteMany({}),
    Tag.deleteMany({}),
    Bundle.deleteMany({}),
    Order.deleteMany({}),
    Payment.deleteMany({}),
    User.deleteMany({ email: { $ne: 'admin@glowe.com' } }),
  ])

  let admin = await User.findOne({ email: 'admin@glowe.com' })
  if (!admin) {
    admin = await User.create({
      name: 'Administrador Glowe',
      email: 'admin@glowe.com',
      password: 'admin123',
      role: 'admin',
      status: 'Activo',
    })
  } else {
    admin.role = 'admin'
    admin.status = 'Activo'
    await admin.save()
  }

  const clientUser = await User.create({
    name: 'Camila Morales',
    email: 'cliente@glowe.com',
    password: 'cliente123',
    role: 'user',
    status: 'Activo',
  })

  await Category.insertMany(SEED_CATEGORIES)
  await Tag.insertMany(SEED_TAGS)
  const products = await Product.insertMany(SEED_PRODUCTS)

  const [p1, p2, , , , p6, p7] = products
  if (p1 && p2) {
    await Bundle.create([
      {
        name: 'Dúo Mirada de Impacto',
        desc: 'Jabón Brow Styling Trendy + Gel Sculpt Montoc con biotina.',
        price: 48000,
        oldPrice: 54000,
        badge: 'TOP COMBO',
        image: p1.image,
        productIds: [p1._id, p2._id],
        isActive: true,
      },
      ...(p6 && p7 ? [{
        name: 'Glow Beauty Essentials Box',
        desc: 'Shampoo Alma de Romero + Tinta Sweet Kiss para cuidado integral.',
        price: 64000,
        oldPrice: 72000,
        badge: 'GLOW SET',
        image: p7.image,
        productIds: [p6._id, p7._id],
        isActive: true,
      }] : []),
    ])
  }

  // Pedidos: 1 entrante, 1 venta confirmada con abono, 1 venta pagada
  await Order.create({
    invoice: 'FAC-2026-001',
    customer: 'Valentina Restrepo',
    customerEmail: 'valentina.restrepo@gmail.com',
    customerPhone: '3124567890',
    shippingAddress: 'Cra 43A # 18 Sur - 45, Apto 502',
    customerCity: 'Medellín',
    customerDepartment: 'Antioquia',
    status: 'Pendiente',
    paymentMethod: 'contra_entrega',
    paymentStatus: 'Sin pagos',
    items: [{ productId: p1._id, title: p1.name, quantity: 2, price: p1.price, image: p1.image }],
    subtotal: 44000,
    shippingCost: 12000,
    total: 56000,
    amountPaid: 0,
    balance: 56000,
    notes: 'Entregar en portería después de las 2:00 PM.',
  })

  const order2 = await Order.create({
    userId: clientUser._id,
    invoice: 'FAC-2026-002',
    customer: 'Camila Morales',
    customerEmail: 'cliente@glowe.com',
    customerPhone: '3019876543',
    shippingAddress: 'Calle 127 # 14 - 30, Torre 2 Apto 804',
    customerCity: 'Bogotá',
    customerDepartment: 'Cundinamarca',
    status: 'Confirmada',
    paymentMethod: 'abono',
    paymentStatus: 'Abonada',
    items: [
      { productId: p1._id, title: p1.name, quantity: 1, price: p1.price, image: p1.image },
      { productId: p2._id, title: p2.name, quantity: 1, price: p2.price, image: p2.image },
    ],
    subtotal: 54000,
    shippingCost: 10000,
    total: 64000,
    amountPaid: 32000,
    balance: 32000,
    notes: 'Llamar antes de llegar. Dejar con celador Carlos.',
  })

  await Payment.create({
    orderId: order2._id,
    userId: clientUser._id,
    amount: 32000,
    method: 'Transferencia',
    reference: 'NEQ-884210',
    status: 'Confirmado',
    note: 'Abono 50% inicial Nequi',
    registeredBy: admin._id,
  })

  const order3 = await Order.create({
    invoice: 'FAC-2026-003',
    customer: 'Laura Sofía Gómez',
    customerEmail: 'laura.gomez@hotmail.com',
    customerPhone: '3157891234',
    shippingAddress: 'Av San Juan # 70 - 15',
    customerCity: 'Medellín',
    customerDepartment: 'Antioquia',
    status: 'En preparación',
    paymentMethod: 'transferencia_completa',
    paymentStatus: 'Pagada',
    items: [{ productId: p6._id, title: p6.name, quantity: 1, price: p6.price, image: p6.image }],
    subtotal: 48000,
    shippingCost: 12000,
    total: 60000,
    amountPaid: 60000,
    balance: 0,
    notes: 'Tocar timbre 301.',
  })

  await Payment.create({
    orderId: order3._id,
    amount: 60000,
    method: 'Transferencia',
    reference: 'BCOL-993182',
    status: 'Confirmado',
    note: 'Pago total Bancolombia',
    registeredBy: admin._id,
  })

  console.log(`✅ Seed completado: ${products.length} productos, categorías, pedidos y abonos creados.`)
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Error en seed:', err)
  process.exit(1)
})
