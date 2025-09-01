import { Pool, PoolConfig } from 'pg';
import { logger } from '../utils/logger';
import path from 'path';

// Datenbank-Konfiguration
const dbConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'steuer_fair',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20, // Maximale Anzahl von Verbindungen im Pool
  idleTimeoutMillis: 30000, // Verbindung wird nach 30 Sekunden Inaktivität geschlossen
  connectionTimeoutMillis: 2000, // Timeout für neue Verbindungen
};

// PostgreSQL-Pool erstellen
export const pool = new Pool(dbConfig);

// Datenbank-Verbindung testen
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    logger.info('Datenbank-Verbindung erfolgreich', { timestamp: result.rows[0].now });
    return true;
  } catch (error) {
    logger.error('Datenbank-Verbindung fehlgeschlagen:', error);
    return false;
  }
};

// Datenbank-Pool schließen
export const closePool = async (): Promise<void> => {
  await pool.end();
  logger.info('Datenbank-Pool geschlossen');
};
