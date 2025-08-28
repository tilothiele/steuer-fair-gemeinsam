import { Pool } from 'pg';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

// Lade .env-Datei
dotenv.config();

// Debug: Zeige geladene Umgebungsvariablen
logger.info('Database connection configuration:', {
  user: process.env.DB_USER || 'postgres (default)',
  host: process.env.DB_HOST || 'localhost (default)',
  database: process.env.DB_NAME || 'steuer_fair (default)',
  port: process.env.DB_PORT || '5432 (default)',
  passwordSet: !!process.env.DB_PASSWORD
});

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'steuer_fair',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  logger.info('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export { pool };
