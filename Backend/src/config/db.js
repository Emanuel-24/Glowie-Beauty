import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn('MONGODB_URI no definido. El backend arrancará sin base de datos conectada.');
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB conectado correctamente');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;
