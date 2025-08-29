import { Router } from 'express';
import { TaxRepository } from '../repositories/tax-repository';
import { TaxCalculationRequestSchema } from '@steuer-fair/shared';
import { logger } from '../utils/logger';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Steuerdaten für Benutzer und Jahr laden
router.get('/:loginId/:year', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { loginId, year } = req.params;
    const taxYear = parseInt(year);

    // Benutzer-Validierung: Nur eigene Daten abrufen
    if (req.user && req.user.name !== loginId && req.user.id !== loginId) {
      return res.status(403).json({
        success: false,
        error: 'Sie können nur Ihre eigenen Daten abrufen'
      });
    }

    if (isNaN(taxYear)) {
      return res.status(400).json({
        success: false,
        error: 'Ungültiges Steuerjahr'
      });
    }

    const taxData = await TaxRepository.findByUserAndYear(loginId, taxYear);

    if (!taxData) {
      return res.json({
        success: true,
        data: null,
        message: 'Keine Daten für dieses Jahr gefunden'
      });
    }

    res.json({
      success: true,
      data: {
        partnerA: taxData.partnerA,
        partnerB: taxData.partnerB,
        jointData: taxData.jointData,
        year: taxData.taxYear
      }
    });
  } catch (error) {
    logger.error('Fehler beim Laden der Steuerdaten:', error);
    res.status(500).json({
      success: false,
      error: 'Interner Server-Fehler'
    });
  }
});

// Steuerdaten speichern
router.post('/save', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const validationResult = TaxCalculationRequestSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Ungültige Eingabedaten',
        details: validationResult.error.errors
      });
    }

    const taxData = validationResult.data;

    // Benutzer-Validierung: Nur eigene Daten speichern
    if (req.user && req.user.name !== taxData.userId && req.user.id !== taxData.userId) {
      return res.status(403).json({
        success: false,
        error: 'Sie können nur Ihre eigenen Daten speichern'
      });
    }

    const savedData = await TaxRepository.save(taxData);

    logger.info('Steuerdaten erfolgreich gespeichert', {
      userId: taxData.userId,
      year: taxData.year
    });

    res.json({
      success: true,
      data: {
        partnerA: savedData.partnerA,
        partnerB: savedData.partnerB,
        jointData: savedData.jointData,
        year: savedData.taxYear
      },
      message: 'Daten erfolgreich gespeichert'
    });
  } catch (error) {
    logger.error('Fehler beim Speichern der Steuerdaten:', error);
    res.status(500).json({
      success: false,
      error: 'Interner Server-Fehler'
    });
  }
});

export { router as taxDataRoutes };
