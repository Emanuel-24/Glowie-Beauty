import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import cors from 'cors';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import tagRoutes from './routes/tagRoutes.js';
import siteConfigRoutes from './routes/siteConfigRoutes.js';
import subscriberRoutes from './routes/subscriberRoutes.js';
import bundleRoutes from './routes/bundleRoutes.js';

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para asegurar codificación UTF-8 en todas las respuestas
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      port: PORT,
    },
    message: 'API funcionando correctamente',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/site-config', siteConfigRoutes);
app.use('/api/newsletter', subscriberRoutes);
app.use('/api/bundles', bundleRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    data: null,
    message: 'Error interno del servidor',
  });
});

await connectDB();

app.listen(PORT, () => {
  console.log(`Servidor levantado en http://localhost:${PORT}`);
});

export default app;
