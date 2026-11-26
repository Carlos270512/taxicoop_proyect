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
import dashboardRoutes from './lib/Dashboard/infrastructure/dashboard.routes';
import votacionRouter from './lib/Votacion/infrastructure/votacion.routes';
import assistantRoutes from './lib/Assistant/infrastructure/assistant.routes';
import ubicacionRoutes from './lib/Ubicacion/infrastructure/ubicacion.routes';

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
    console.log('Modelos cargados. El esquema se gestiona con migraciones (npm run db:migrate).');

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
     app.use('/api/votacion', votacionRouter);
    app.use('/api/socios', socioRoutes);
    app.use('/api/unidades', unidadRoutes);
    app.use('/api/emergencias', emergencyRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/assistant', assistantRoutes);
    app.use('/api/ubicaciones', ubicacionRoutes);
   

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