import { Router } from 'express';
import { TaxCalculator } from '@steuer-fair/shared';
import { TaxCalculationRequestSchema, TaxCalculationResponse } from '@steuer-fair/shared';
import { logger } from '../utils/logger';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

/**
 * POST /api/tax/calculate
 * Berechnet die faire Aufteilung der Steuerersparnis
 */
router.post('/calculate', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    // Validiere Request Body
    const validatedData = TaxCalculationRequestSchema.parse(req.body);
    const { partnerA, partnerB, jointData, year } = validatedData;

    // Validiere Partner-Daten
    const validationErrors = TaxCalculator.validatePartners(partnerA, partnerB, jointData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validierungsfehler',
        details: validationErrors
      });
    }

    // Berechne Steuern automatisch
    const partnerATaxes = TaxCalculator.calculateIndividualTax(partnerA);
    const partnerBTaxes = TaxCalculator.calculateIndividualTax(partnerB);
    const jointTaxes = TaxCalculator.calculateJointTax(jointData);

    // Aktualisiere Partner mit berechneten Werten
    const updatedPartnerA = { ...partnerA, fee: partnerATaxes.fee, fse: partnerATaxes.fse };
    const updatedPartnerB = { ...partnerB, fee: partnerBTaxes.fee, fse: partnerBTaxes.fse };
    const updatedJointData = { ...jointData, gfe: jointTaxes.gfe, gfs: jointTaxes.gfs };

    // Berechne faire Aufteilung
    const result = TaxCalculator.calculateFairSplit(updatedPartnerA, updatedPartnerB, updatedJointData);

    // Log erfolgreiche Berechnung
    logger.info({
      message: 'Steuerberechnung erfolgreich',
      partnerA: { id: partnerA.id, sek: partnerA.sek },
      partnerB: { id: partnerB.id, sek: partnerB.sek },
      plausibilityCheck: result.plausibilityCheck,
      year: year
    });

    const response: TaxCalculationResponse = {
      success: true,
      data: result
    };

    res.json(response);

  } catch (error) {
    logger.error({
      message: 'Fehler bei Steuerberechnung',
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(500).json({
      success: false,
      error: 'Fehler bei der Steuerberechnung'
    });
  }
});

/**
 * GET /api/tax/health
 * Health Check für Tax-Service
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'tax-calculator',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/tax/tax-brackets
 * Gibt die aktuellen Steuertarife zurück
 */
router.get('/tax-brackets', (req, res) => {
  const taxBrackets = [
    { threshold: 0, rate: 0.14, base: 0, description: 'Grundtarif' },
    { threshold: 10908, rate: 0.239, base: 1527.12, description: 'Linearer Tarif' },
    { threshold: 62809, rate: 0.42, base: 14532.57, description: 'Spitzensteuersatz' },
    { threshold: 277825, rate: 0.45, base: 103643.97, description: 'Reichensteuer' }
  ];

  res.json({
    success: true,
    data: {
      year: 2024,
      brackets: taxBrackets,
      solidarityRate: 0.055,
      churchTaxRate: 0.09
    }
  });
});

export { router as taxRoutes };
