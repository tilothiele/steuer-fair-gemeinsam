import { Router } from 'express';
import { TaxRepository } from '../repositories/tax-repository';
import { TaxCalculationRequestSchema } from '@steuer-fair/shared';
import { logger } from '../utils/logger';

const router = Router();

// Steuerdaten für Benutzer und Jahr laden
router.get('/:loginId/:year', async (req, res) => {
  try {
    const { loginId, year } = req.params;
    const taxYear = parseInt(year);

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
router.post('/save', async (req, res) => {
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
