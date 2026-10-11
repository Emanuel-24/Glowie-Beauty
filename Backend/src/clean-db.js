import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';

import Category from './models/Category.js';
import Order from './models/Order.js';
import Payment from './models/Payment.js';
import Product from './models/Product.js';
import SiteConfig from './models/SiteConfig.js';
import Subscriber from './models/Subscriber.js';
import Tag from './models/Tag.js';
import User from './models/User.js';
import Bundle from './models/Bundle.js';

dotenv.config();

const cleanDatabase = async () => {
  console.log('--- INICIANDO PURGA DE BASE DE DATOS OPERATIVA (GLOWE BEAUTY) ---');

  // 1. Validaciones de entorno y seguridad
  if (process.env.NODE_ENV === 'production') {
    console.error('⛔ SEGURIDAD: Operación cancelada. El script clean-db no está permitido en entorno de producción (NODE_ENV=production).');
    process.exit(1);
  }

  if (!process.env.MONGODB_URI) {
    console.error('❌ ERROR: MONGODB_URI no está definido en las variables de entorno. Operación cancelada.');
    process.exit(1);
  }

  // 2. Conexión a MongoDB
  await connectDB();

  try {
    // 3. Validación previa de cuentas Administrador
    const adminUsers = await User.find({ role: 'admin' }).select('name email role').lean();

    if (adminUsers.length === 0) {
      console.error('⚠️ ALERTA CRÍTICA: No se encontró ningún usuario con rol "admin" en la base de datos.');
      console.error('⛔ Para prevenir dejar el sistema sin acceso administrativo, se aborta la purga.');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`🔍 Se identificaron ${adminUsers.length} cuenta(s) con rol de Administrador para ser preservadas.`);

    // 4. Purga selectiva con deleteMany (preserva esquemas e índices)
    const [
      productsResult,
      categoriesResult,
      tagsResult,
      ordersResult,
      paymentsResult,
      subscribersResult,
      siteConfigResult,
      regularUsersResult,
      bundlesResult,
    ] = await Promise.all([
      Product.deleteMany({}),
      Category.deleteMany({}),
      Tag.deleteMany({}),
      Order.deleteMany({}),
      Payment.deleteMany({}),
      Subscriber.deleteMany({}),
      SiteConfig.deleteMany({}),
      User.deleteMany({ role: { $ne: 'admin' } }),
      Bundle.deleteMany({}),
    ]);

    // 5. Verificación de colecciones residuales o índices
    console.log('\n--- SINCRONIZANDO ÍNDICES DE MONGOOSE ---');
    await Promise.all([
      Product.syncIndexes(),
      Category.syncIndexes(),
      Tag.syncIndexes(),
      Order.syncIndexes(),
      Payment.syncIndexes(),
      Subscriber.syncIndexes(),
      SiteConfig.syncIndexes(),
      User.syncIndexes(),
      Bundle.syncIndexes(),
    ]);
    console.log('✓ Índices sincronizados y consistentes en todas las colecciones.');

    // 6. Reporte detallado de purga
    console.log('\n--- RESUMEN DE DOCUMENTOS ELIMINADOS ---');
    console.log(`- Productos (Product): ${productsResult.deletedCount}`);
    console.log(`- Combos / Bundles (Bundle): ${bundlesResult.deletedCount}`);
    console.log(`- Categorías (Category): ${categoriesResult.deletedCount}`);
    console.log(`- Etiquetas (Tag): ${tagsResult.deletedCount}`);
    console.log(`- Pedidos / Órdenes (Order): ${ordersResult.deletedCount}`);
    console.log(`- Pagos y abonos (Payment): ${paymentsResult.deletedCount}`);
    console.log(`- Suscriptores (Subscriber): ${subscribersResult.deletedCount}`);
    console.log(`- Configuraciones del sitio (SiteConfig): ${siteConfigResult.deletedCount}`);
    console.log(`- Usuarios normales / clientes (User role!=admin): ${regularUsersResult.deletedCount}`);

    // 7. Confirmación explícita de administradores preservados
    console.log('\n--- CUENTAS ADMINISTRATIVAS PRESERVADAS ---');
    adminUsers.forEach((admin) => {
      console.log(`Administrador preservado: ${admin.email}`);
    });

    console.log('\n✅ Purga completada con éxito. La base de datos está lista para pruebas integrales desde cero.');
  } catch (error) {
    console.error('❌ Ocurrió un error durante la purga de la base de datos:', error);
    await mongoose.disconnect();
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔒 Conexión con MongoDB cerrada limpiamente.');
  }

  process.exit(0);
};

cleanDatabase().catch(async (error) => {
  console.error('❌ Error no controlado en script clean-db:', error);
  try {
    await mongoose.disconnect();
  } catch (_) {
    // ignorar fallo al desconectar en catch final
  }
  process.exit(1);
});
