import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import pkg from 'pg';
const { Client } = pkg;

dotenv.config({ path: path.resolve(__dirname, '../../../../../.env') });

const dbName = process.env.DB_NAME || 'taxicoop_db';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = Number(process.env.DB_PORT) || 5432;

// Función para asegurar que la base de datos relacional exista antes de conectar Sequelize
export async function createDatabaseIfNotExists(): Promise<void> {
  const client = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: 'postgres',
  });

  try {
    await client.connect();
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
    
    if (res.rowCount === 0) {
      console.log(`La base de datos '${dbName}' no existe. Creándola desde Node.js...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Base de datos '${dbName}' creada exitosamente.`);
    } else {
      console.log(`La base de datos '${dbName}' ya existe.`);
    }
  } catch (error) {
    console.error('Error al verificar/crear la base de datos en PostgreSQL:', error);
    throw error;
  } finally {
    await client.end();
  }
}

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  logging: false,
});