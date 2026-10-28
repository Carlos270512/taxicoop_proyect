import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize, createDatabaseIfNotExists } from './lib/Shared/infrastructure/database/sequelize.config';
import { connectMongo } from './lib/Shared/infrastructure/database/mongoose.config';
import { registerModels } from './lib/Shared/infrastructure/database/models.registry';
import socioRoutes from './lib/Socio/infrastructure/socio.routes';
import unidadRoutes from './lib/Unidad/infrastructure/unidad.routes';
import emergencyRoutes from './lib/Emergencia/infrastructure/emergency.routes';
import authRoutes from './lib/Identity/infrastructure/auth.routes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    // 0. Crear la base de datos en PostgreSQL si no existe (Desde Node.js)
    await createDatabaseIfNotExists();

    // 1. Autenticar y sincronizar PostgreSQL con Sequelize
    await sequelize.authenticate();
    console.log('Base de datos PostgreSQL conectada correctamente.');
    
    registerModels();
    await sequelize.sync({ alter: true });
    console.log('Tablas sincronizadas en PostgreSQL.');

    // 2. Conectar a MongoDB con Mongoose
    await connectMongo();

    // Ruta de salud de la API
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'OK',
        message: 'TaxiCoop Analytics Backend funcionando al 100%',
        timestamp: new Date().toISOString()
      });
    });
    app.use('/api/socios', socioRoutes);
    app.use('/api/unidades', unidadRoutes);
    app.use('/api/emergencias', emergencyRoutes);
    app.use('/api/auth', authRoutes);

    // Levantar servidor
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });

  } catch (error) {
    console.error('Error crítico al iniciar la aplicación:', error);
    process.exit(1);
  }
}

bootstrap();