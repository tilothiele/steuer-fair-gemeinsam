import { Flyway } from 'node-flyway';
import { logger } from '../utils/logger';
import { flywayConfig, pool } from '../config/database';

export class MigrationService {
  private flyway: Flyway;

  constructor() {
    logger.info('Initialisiere Migration-Service mit Konfiguration:', {
      url: flywayConfig.url,
      user: flywayConfig.user,
      migrationLocations: flywayConfig.migrationLocations,
      nodeEnv: process.env.NODE_ENV
    });
    this.flyway = new Flyway(flywayConfig);
  }

  /**
   * Führt alle ausstehenden Migrationen aus
   */
  async migrate(): Promise<void> {
    try {
      logger.info('Starte Datenbank-Migration...');

      const response = await this.flyway.migrate();

      if (!response.success) {
        throw new Error(`Migration fehlgeschlagen: ${response.error?.errorCode}`);
      }

      logger.info('Datenbank-Migration erfolgreich abgeschlossen', {
        migrationsExecuted: response.flywayResponse?.migrationsExecuted,
        executionTime: response.additionalDetails?.executionTime
      });
    } catch (error) {
      logger.error('Datenbank-Migration fehlgeschlagen:', error);
      throw error;
    }
  }

  /**
   * Zeigt den aktuellen Migration-Status
   */
  async info(): Promise<void> {
    try {
      logger.info('Prüfe Migration-Status...');

      const response = await this.flyway.info();

      if (!response.success) {
        throw new Error(`Info-Abfrage fehlgeschlagen: ${response.error?.errorCode}`);
      }

      const migrations = response.flywayResponse?.migrations || [];
      const pendingCount = migrations.filter(m => m.state === 'Pending').length;
      const appliedCount = migrations.filter(m => m.state === 'Success').length;

      logger.info('Migration-Status:', {
        pendingMigrations: pendingCount,
        appliedMigrations: appliedCount,
        totalMigrations: migrations.length,
        executionTime: response.additionalDetails?.executionTime
      });
    } catch (error) {
      logger.error('Migration-Status-Prüfung fehlgeschlagen:', error);
      throw error;
    }
  }

  /**
   * Validiert die Migrationen
   */
  async validate(): Promise<void> {
    try {
      logger.info('Validiere Migrationen...');

      const response = await this.flyway.validate();

      if (!response.success) {
        throw new Error(`Validierung fehlgeschlagen: ${response.error?.errorCode}`);
      }

      // Validierung erfolgreich, wenn keine Fehler aufgetreten sind
      logger.info('Migration-Validierung erfolgreich', {
        executionTime: response.additionalDetails?.executionTime
      });
    } catch (error) {
      logger.error('Migration-Validierung fehlgeschlagen:', error);
      throw error;
    }
  }

  /**
   * Bereinigt die Datenbank (VORSICHT!)
   */
  async clean(): Promise<void> {
    try {
      logger.warn('Bereinige Datenbank (VORSICHT!)...');

      const response = await this.flyway.clean();

      if (!response.success) {
        throw new Error(`Clean fehlgeschlagen: ${response.error?.errorCode}`);
      }

      const schemasCleaned = response.flywayResponse?.schemasCleaned || [];

      logger.info('Datenbank-Bereinigung erfolgreich', {
        schemasCleaned,
        executionTime: response.additionalDetails?.executionTime
      });
    } catch (error) {
      logger.error('Datenbank-Bereinigung fehlgeschlagen:', error);
      throw error;
    }
  }

  /**
   * Prüft, ob Migrationen ausstehen
   */
  async hasPendingMigrations(): Promise<boolean> {
    try {
      const response = await this.flyway.info();

      if (!response.success) {
        logger.error('Prüfung ausstehender Migrationen fehlgeschlagen:', response.error);
        return false;
      }

      const migrations = response.flywayResponse?.migrations || [];
      const hasPending = migrations.some(m => m.state === 'Pending');

      logger.info('Ausstehende Migrationen geprüft', {
        hasPending,
        totalMigrations: migrations.length
      });

      return hasPending;
    } catch (error) {
      logger.error('Prüfung ausstehender Migrationen fehlgeschlagen:', error);
      return false;
    }
  }

  /**
   * Führt Migration nur aus, wenn ausstehende Migrationen vorhanden sind
   * TT - funktioniert nicht
   */
  async migrateIfNeeded(): Promise<void> {
    try {

      const hasPending = await this.hasPendingMigrations();

      if (hasPending) {
        logger.info('Ausstehende Migrationen gefunden, führe Migration aus...');
        await this.migrate();
      } else {
        logger.info('Keine ausstehenden Migrationen gefunden');

        // Fallback: Prüfe, ob Tabellen existieren, wenn nicht, führe Migration aus
        const tablesExist = await this.checkTablesExist();
        if (!tablesExist) {
          logger.error('Tabellen existieren nicht, beende programm');
          process.exit(1);
          //await this.runFallbackMigration();
        }
      }
    } catch (error) {
      logger.error('Bedingte Migration fehlgeschlagen:', error);
      throw error;
    }
  }

  /**
   * Prüft, ob die benötigten Tabellen existieren
   */
  private async checkTablesExist(): Promise<boolean> {
    try {
      const client = await pool.connect();
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'users'
        );
      `);
      client.release();
      return result.rows[0].exists;
    } catch (error) {
      logger.error('Fehler beim Prüfen der Tabellen:', error);
      return false;
    }
  }

  /**
   * Führt eine Fallback-Migration aus, wenn Flyway nicht funktioniert
   */
  private async runFallbackMigration(): Promise<void> {
    try {
      logger.info('Führe Fallback-Migration aus...');

      const client = await pool.connect();

      // Migration SQL aus der Datei lesen
      const fs = require('fs');
      const path = require('path');
      const migrationPath = path.join(process.cwd(), 'migrations', 'V1__Initial.sql');

      if (fs.existsSync(migrationPath)) {
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');
        await client.query(migrationSql);
        logger.info('Fallback-Migration erfolgreich ausgeführt');
      } else {
        logger.error('Migration-Datei nicht gefunden:', migrationPath);
      }

      client.release();
    } catch (error) {
      logger.error('Fallback-Migration fehlgeschlagen:', error);
      throw error;
    }
  }

  /**
   * Erstellt eine Baseline-Migration
   */
  async baseline(version: string): Promise<void> {
    try {
      logger.info(`Erstelle Baseline-Migration für Version ${version}...`);

      const response = await this.flyway.baseline();

      if (!response.success) {
        throw new Error(`Baseline fehlgeschlagen: ${response.error?.errorCode}`);
      }

      logger.info('Baseline-Migration erfolgreich erstellt', {
        version,
        executionTime: response.additionalDetails?.executionTime
      });
    } catch (error) {
      logger.error('Baseline-Migration fehlgeschlagen:', error);
      throw error;
    }
  }

  /**
   * Repariert Migration-Probleme
   */
  async repair(): Promise<void> {
    try {
      logger.info('Repariere Migration-Probleme...');

      const response = await this.flyway.repair();

      if (!response.success) {
        throw new Error(`Repair fehlgeschlagen: ${response.error?.errorCode}`);
      }

      logger.info('Migration-Repair erfolgreich abgeschlossen', {
        executionTime: response.additionalDetails?.executionTime
      });
    } catch (error) {
      logger.error('Migration-Repair fehlgeschlagen:', error);
      throw error;
    }
  }
}
