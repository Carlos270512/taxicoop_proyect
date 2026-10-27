import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export async function connectMongo(): Promise<void> {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/taxicoop_mongo';
    await mongoose.connect(mongoUri);
    console.log('MongoDB conectado exitosamente (Mongoose).');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
    process.exit(1);
  }
}