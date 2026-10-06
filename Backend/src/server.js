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

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
