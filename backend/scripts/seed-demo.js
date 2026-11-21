/* Seed de demostracion: crea socios, unidades, una votacion activa y una alerta.
 * Es idempotente: si ya hay socios registrados no hace nada.
 *
 * Uso:  npm run db:seed
 *       docker compose exec backend node scripts/seed-demo.js
 */
require('dotenv').config();

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { Client } = require('pg');
const mongoose = require('mongoose');

const PASSWORD = 'Taxicoop2026*';

const SOCIOS = [
  {
    email: 'luis.mera@poletaxicoop.com',
    cedulaRuc: '1312345678',
    nombres: 'Luis Andrés',
    apellidos: 'Mera Cedeño',
    telefono: '0991234567',
    unidad: { numeroUnidad: 'U-101', placa: 'MAB-1234', anioVehiculo: 2021 },
  },
  {
    email: 'maria.zambrano@poletaxicoop.com',
    cedulaRuc: '1309876543',
    nombres: 'María Fernanda',
    apellidos: 'Zambrano Ruiz',
    telefono: '0987654321',
    unidad: { numeroUnidad: 'U-102', placa: 'MCD-5678', anioVehiculo: 2019 },
  },
];

async function seedPostgres() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
    database: process.env.DB_NAME || 'taxicoop_db',
  });

  await client.connect();

  const { rows: existing } = await client.query('select count(*)::int as total from socios');
  if (existing[0].total > 0) {
    console.log(`Ya existen ${existing[0].total} socios: no se crea nada (seed idempotente).`);
    await client.end();
    return;
  }

  const { rows: roleRows } = await client.query("select id from roles where nombre = 'SOCIO'");
  const socioRoleId = roleRows[0] && roleRows[0].id;

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  for (const socio of SOCIOS) {
    const userId = crypto.randomUUID();
    const socioId = crypto.randomUUID();

    await client.query(
      `insert into users_auth (id, email, "passwordHash", "createdAt", "updatedAt")
       values ($1, $2, $3, now(), now())`,
      [userId, socio.email, passwordHash],
    );

    if (socioRoleId) {
      await client.query(
        `insert into user_roles ("userId", "roleId", "createdAt", "updatedAt")
         values ($1, $2, now(), now())`,
        [userId, socioRoleId],
      );
    }

    await client.query(
      `insert into socios (id, user_id, "cedulaRuc", nombres, apellidos, telefono, estado, "createdAt", "updatedAt")
       values ($1, $2, $3, $4, $5, $6, 'ACTIVO', now(), now())`,
      [socioId, userId, socio.cedulaRuc, socio.nombres, socio.apellidos, socio.telefono],
    );

    await client.query(
      `insert into unidades (id, "numeroUnidad", placa, "anioVehiculo", "socioId", estado, "createdAt", "updatedAt")
       values ($1, $2, $3, $4, $5, 'OPERATIVA', now(), now())`,
      [crypto.randomUUID(), socio.unidad.numeroUnidad, socio.unidad.placa, socio.unidad.anioVehiculo, socioId],
    );
  }

  const electionId = crypto.randomUUID();
  await client.query(
    `insert into elections (id, title, description, "startDate", "endDate", status, "createdAt", "updatedAt")
     values ($1, $2, $3, now(), now() + interval '30 days', 'ACTIVE', now(), now())`,
    [electionId, 'Aprobación del presupuesto 2027', 'Votación de ejemplo para el panel'],
  );

  for (const option of ['A favor', 'En contra']) {
    await client.query(
      `insert into election_options (id, "electionId", title, description, "createdAt", "updatedAt")
       values ($1, $2, $3, '', now(), now())`,
      [crypto.randomUUID(), electionId, option],
    );
  }

  await client.end();
  console.log(`PostgreSQL: ${SOCIOS.length} socios, ${SOCIOS.length} unidades y 1 votación activa.`);
}

async function seedMongo() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/taxicoop_mongo';
  await mongoose.connect(uri);

  const schema = new mongoose.Schema(
    {
      socioId: String,
      numeroUnidad: String,
      ubicacion: { latitud: Number, longitud: Number },
      estado: { type: String, default: 'PENDIENTE' },
    },
    { collection: 'emergencyalerts', versionKey: false, timestamps: { createdAt: true, updatedAt: false } },
  );

  const Alert = mongoose.models.SeedEmergencyAlert || mongoose.model('SeedEmergencyAlert', schema);

  const exists = await Alert.countDocuments({ numeroUnidad: 'U-101' });
  if (exists > 0) {
    console.log('MongoDB: la alerta de ejemplo ya existe (seed idempotente).');
  } else {
    await Alert.create({
      socioId: 'seed-demo',
      numeroUnidad: 'U-101',
      ubicacion: { latitud: -2.9001, longitud: -79.0059 },
      estado: 'PENDIENTE',
    });
    console.log('MongoDB: 1 alerta de emergencia pendiente.');
  }

  await mongoose.disconnect();
}

(async () => {
  try {
    await seedPostgres();
    await seedMongo();
    console.log('Seed completado.');
    process.exit(0);
  } catch (error) {
    console.error('Error en el seed:', error.message);
    process.exit(1);
  }
})();
