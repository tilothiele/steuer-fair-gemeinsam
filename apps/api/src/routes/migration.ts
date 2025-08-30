import { Router } from 'express';
import { MigrationService } from '../services/migration-service';
import { logger } from '../utils/logger';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Migration-Service nur erstellen, wenn USE_FLYWAY=true
const getMigrationService = () => {
  if (process.env.USE_FLYWAY !== 'true') {
    throw new Error('Flyway-Migration ist deaktiviert. Setzen Sie USE_FLYWAY=true um Migrationen zu verwenden.');
  }
  return new MigrationService();
};

/**
 * GET /api/migration/info
 * Zeigt den aktuellen Migration-Status
 */
router.get('/info', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const migrationService = getMigrationService();
    await migrationService.info();
    res.json({
      success: true,
      message: 'Migration-Status erfolgreich abgerufen',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Migration-Info-Fehler:', error);
    res.status(500).json({
      success: false,
      error: 'Migration-Status konnte nicht abgerufen werden',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    });
  }
});

/**
 * POST /api/migration/migrate
 * Führt alle ausstehenden Migrationen aus
 */
router.post('/migrate', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const migrationService = getMigrationService();
    await migrationService.migrate();
    res.json({
      success: true,
      message: 'Migration erfolgreich ausgeführt',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Migration-Fehler:', error);
    res.status(500).json({
      success: false,
      error: 'Migration konnte nicht ausgeführt werden',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    });
  }
});

/**
 * POST /api/migration/validate
 * Validiert die Migrationen
 */
router.post('/validate', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const migrationService = getMigrationService();
    await migrationService.validate();
    res.json({
      success: true,
      message: 'Migration-Validierung erfolgreich',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Migration-Validierung-Fehler:', error);
    res.status(500).json({
      success: false,
      error: 'Migration-Validierung fehlgeschlagen',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    });
  }
});

/**
 * POST /api/migration/clean
 * Bereinigt die Datenbank (VORSICHT!)
 */
router.post('/clean', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    // Zusätzliche Sicherheitsabfrage
    const { confirm } = req.body;
    if (confirm !== 'JA_ICH_BIN_MIR_SICHER') {
      return res.status(400).json({
        success: false,
        error: 'Bestätigung erforderlich. Senden Sie confirm: "JA_ICH_BIN_MIR_SICHER"'
      });
    }

    const migrationService = getMigrationService();
    await migrationService.clean();
    res.json({
      success: true,
      message: 'Datenbank erfolgreich bereinigt',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Migration-Clean-Fehler:', error);
    res.status(500).json({
      success: false,
      error: 'Datenbank-Bereinigung fehlgeschlagen',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    });
  }
});

/**
 * GET /api/migration/status
 * Prüft, ob ausstehende Migrationen vorhanden sind
 */
router.get('/status', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const migrationService = getMigrationService();
    const hasPending = await migrationService.hasPendingMigrations();
    res.json({
      success: true,
      hasPendingMigrations: hasPending,
      message: hasPending ? 'Ausstehende Migrationen gefunden' : 'Keine ausstehenden Migrationen',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Migration-Status-Fehler:', error);
    res.status(500).json({
      success: false,
      error: 'Migration-Status konnte nicht geprüft werden',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    });
  }
});

/**
 * POST /api/migration/baseline
 * Erstellt eine Baseline-Migration
 */
router.post('/baseline', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { version } = req.body;
    if (!version) {
      return res.status(400).json({
        success: false,
        error: 'Version ist erforderlich'
      });
    }

    const migrationService = getMigrationService();
    await migrationService.baseline(version);
    res.json({
      success: true,
      message: `Baseline-Migration für Version ${version} erfolgreich erstellt`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Migration-Baseline-Fehler:', error);
    res.status(500).json({
      success: false,
      error: 'Baseline-Migration fehlgeschlagen',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    });
  }
});

/**
 * POST /api/migration/repair
 * Repariert Migration-Probleme
 */
router.post('/repair', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const migrationService = getMigrationService();
    await migrationService.repair();
    res.json({
      success: true,
      message: 'Migration-Repair erfolgreich abgeschlossen',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Migration-Repair-Fehler:', error);
    res.status(500).json({
      success: false,
      error: 'Migration-Repair fehlgeschlagen',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    });
  }
});

export { router as migrationRoutes };
