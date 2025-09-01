import knex, { Knex } from 'knex';
import { logger } from '../utils/logger';

export class KnexMigrationService {
  private knexInstance: Knex;

  constructor() {
    const environment = process.env.NODE_ENV || 'development';
    
    // Knex-Konfiguration inline definieren
    const knexConfig: Knex.Config = {
      client: 'postgresql',
      connection: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'steuer_fair',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
      },
      migrations: {
        directory: process.env.KNEX_MIGRATIONS_DIR || './migrations',
        extension: 'ts',
        loadExtensions: ['.ts', '.js', '.sql'],
      },
      seeds: {
        directory: process.env.KNEX_SEEDS_DIR || './seeds',
      },
    };
    
    this.knexInstance = knex(knexConfig);
  }

  /**
   * Führt alle ausstehenden Migrationen aus
   */
  async migrate(): Promise<void> {
    try {
      logger.info('Starte Knex.js Migrationen...');
      
      // Führe Migrationen aus
      const [batchNo, log] = await this.knexInstance.migrate.latest();
      
      if (log.length === 0) {
        logger.info('Keine neuen Migrationen gefunden');
      } else {
        logger.info(`Migrationen erfolgreich ausgeführt. Batch: ${batchNo}`);
        log.forEach((migration: string) => {
          logger.info(`- ${migration}`);
        });
      }
    } catch (error) {
      logger.error('Fehler bei der Migration:', error);
      throw error;
    }
  }

  /**
   * Prüft den aktuellen Migrations-Status
   */
  async getMigrationStatus(): Promise<{
    current: string[];
    pending: string[];
    completed: string[];
  }> {
    try {
      const current = await this.knexInstance.migrate.currentVersion();
      const list = await this.knexInstance.migrate.list();
      
      return {
        current: [current],
        pending: list[0], // Pending migrations
        completed: list[1] // Completed migrations
      };
    } catch (error) {
      logger.error('Fehler beim Abrufen des Migrations-Status:', error);
      throw error;
    }
  }

  /**
   * Prüft, ob ausstehende Migrationen vorhanden sind
   */
  async hasPendingMigrations(): Promise<boolean> {
    try {
      const list = await this.knexInstance.migrate.list();
      return list[0].length > 0;
    } catch (error) {
      logger.error('Fehler beim Prüfen ausstehender Migrationen:', error);
      throw error;
    }
  }

  /**
   * Führt Migration nur aus, wenn ausstehende Migrationen vorhanden sind
   */
  async migrateIfNeeded(): Promise<void> {
    try {
      const hasPending = await this.hasPendingMigrations();
      
      if (hasPending) {
        logger.info('Ausstehende Migrationen gefunden, führe Migration aus...');
        await this.migrate();
      } else {
        logger.info('Keine ausstehenden Migrationen gefunden');
        
        // Prüfe, ob die Migrations-Tabelle existiert
        const migrationsTableExists = await this.checkMigrationsTableExists();
        if (!migrationsTableExists) {
          logger.error('Migrations-Tabelle existiert nicht. Datenbank ist nicht initialisiert.');
          throw new Error('Datenbank ist nicht initialisiert. Führe Migration manuell aus.');
        }
      }
    } catch (error) {
      logger.error('Migration fehlgeschlagen:', error);
      throw error;
    }
  }

  /**
   * Prüft, ob die Migrations-Tabelle existiert
   */
  private async checkMigrationsTableExists(): Promise<boolean> {
    try {
      const result = await this.knexInstance.raw(
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'knex_migrations')"
      );
      return result.rows[0].exists;
    } catch (error) {
      logger.error('Fehler beim Prüfen der Migrations-Tabelle:', error);
      return false;
    }
  }

  /**
   * Schließt die Datenbankverbindung
   */
  async closeConnection(): Promise<void> {
    await this.knexInstance.destroy();
    logger.info('Knex.js Verbindung geschlossen');
  }
}
