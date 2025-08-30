import { Flyway } from 'node-flyway';
import { logger } from '../utils/logger';
import { flywayConfig } from '../config/database';

export class MigrationService {
  private flyway: Flyway;

  constructor() {
    console.log('Initialisiere Migration-Service mit Konfiguration:', {
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
      console.log('Starte Datenbank-Migration...');

      const response = await this.flyway.migrate();

      if (!response.success) {
        throw new Error(`Migration fehlgeschlagen: ${response.error?.errorCode}`);
      }

      console.log('Datenbank-Migration erfolgreich abgeschlossen', {
        migrationsExecuted: response.flywayResponse?.migrationsExecuted,
        executionTime: response.additionalDetails?.executionTime
      });
    } catch (error) {
      console.log('Datenbank-Migration fehlgeschlagen:', error);
      throw error;
    }
  }

  /**
   * Zeigt den aktuellen Migration-Status
   */
  async info(): Promise<void> {
    try {
      console.log('Prüfe Migration-Status...');

      const response = await this.flyway.info();

      if (!response.success) {
        throw new Error(`Info-Abfrage fehlgeschlagen - error: ${response.error}`);
      }

      const migrations = response.flywayResponse?.migrations || [];
      const pendingCount = migrations.filter(m => m.state === 'Pending').length;
      const appliedCount = migrations.filter(m => m.state === 'Success').length;

      console.log('Migration-Status:', {
        pendingMigrations: pendingCount,
        appliedMigrations: appliedCount,
        totalMigrations: migrations.length,
        executionTime: response.additionalDetails?.executionTime
      });
    } catch (error) {
      console.log('Migration-Status-Prüfung fehlgeschlagen:', (error as any)?.error, error);
      throw error;
    }
  }

  /**
   * Validiert die Migrationen
   */
  async validate(): Promise<void> {
    try {
      console.log('Validiere Migrationen...');

      const response = await this.flyway.validate();

      if (!response.success) {
        throw new Error(`Validierung fehlgeschlagen: ${response.error?.errorCode}`);
      }

      // Validierung erfolgreich, wenn keine Fehler aufgetreten sind
      console.log('Migration-Validierung erfolgreich', {
        executionTime: response.additionalDetails?.executionTime
      });
    } catch (error) {
      console.log('Migration-Validierung fehlgeschlagen:', error);
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

      console.log('Datenbank-Bereinigung erfolgreich', {
        schemasCleaned,
        executionTime: response.additionalDetails?.executionTime
      });
    } catch (error) {
      console.log('Datenbank-Bereinigung fehlgeschlagen:', error);
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
        console.log('Prüfung ausstehender Migrationen fehlgeschlagen:', response.error);
        return false;
      }

      const migrations = response.flywayResponse?.migrations || [];
      const hasPending = migrations.some(m => m.state === 'Pending');

      console.log('Ausstehende Migrationen geprüft', {
        hasPending,
        totalMigrations: migrations.length
      });

      return hasPending;
    } catch (error) {
      console.log('Prüfung ausstehender Migrationen fehlgeschlagen:', error);
      return false;
    }
  }

  /**
   * Erstellt eine Baseline-Migration
   */
  async baseline(version: string): Promise<void> {
    try {
      console.log(`Erstelle Baseline-Migration für Version ${version}...`);

      const response = await this.flyway.baseline();

      if (!response.success) {
        throw new Error(`Baseline fehlgeschlagen: ${response.error?.errorCode}`);
      }

      console.log('Baseline-Migration erfolgreich erstellt', {
        version,
        executionTime: response.additionalDetails?.executionTime
      });
    } catch (error) {
      console.log('Baseline-Migration fehlgeschlagen:', error);
      throw error;
    }
  }

  /**
   * Repariert Migration-Probleme
   */
  async repair(): Promise<void> {
    try {
      console.log('Repariere Migration-Probleme...');

      const response = await this.flyway.repair();

      if (!response.success) {
        throw new Error(`Repair fehlgeschlagen: ${response.error?.errorCode}`);
      }

      console.log('Migration-Repair erfolgreich abgeschlossen', {
        executionTime: response.additionalDetails?.executionTime
      });
    } catch (error) {
      console.log('Migration-Repair fehlgeschlagen:', error);
      throw error;
    }
  }
}
