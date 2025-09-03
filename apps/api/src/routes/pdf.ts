import { Router } from 'express';
import { PdfService } from '../services/pdf-service';
import { TaxCalculationRequestSchema } from '@steuer-fair/shared';
import { TaxCalculationService } from '@steuer-fair/shared';
import { logger } from '../utils/logger';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

/**
 * POST /api/pdf/download
 * Generiert eine PDF der Steuerberechnung
 */
router.post('/download', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    // Verwende Benutzerdaten aus Token (wie bei anderen Routen)
    const user = req.user;

    // Validiere Request Body
    const validationResult = TaxCalculationRequestSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Ungültige Eingabedaten',
        details: validationResult.error.errors
      });
    }

    const { partnerA, partnerB, jointData, year, userId } = validationResult.data;

    // Benutzer-Validierung: Nur eigene Daten für PDF verwenden
    if (req.user && req.user.name !== userId && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Sie können nur Ihre eigenen Daten für PDF verwenden'
      });
    }

//    console.log(partnerA, partnerB, jointData);

    // Neue Logik für PDF-Route:
    let updatedPartnerA = partnerA;
    let updatedPartnerB = partnerB;
    let updatedJointData = jointData;

    // Nur berechnen wenn NICHT manuell eingegeben
    if (jointData.calculationMode !== 'manual') {
      console.log('Berechne Steuern automatisch');
      // Berechne Steuern automatisch
      const partnerATaxes = TaxCalculationService.calculateIndividualTax(partnerA);
      const partnerBTaxes = TaxCalculationService.calculateIndividualTax(partnerB);
      const jointTaxes = TaxCalculationService.calculateJointTax(jointData);

      // Aktualisiere Partner mit berechneten Werten
      updatedPartnerA = { ...partnerA, fee: partnerATaxes.fee, fse: partnerATaxes.fse };
      updatedPartnerB = { ...partnerB, fee: partnerBTaxes.fee, fse: partnerBTaxes.fse };
      updatedJointData = { ...jointData, gfe: jointTaxes.gfe, gfs: jointTaxes.gfs };
    } else {
      console.log('Berechne Steuern manuell');
    }

//    console.log(updatedPartnerA, updatedPartnerB, updatedJointData);
    // Führe die faire Aufteilung durch (mit korrekten Werten)
    const result = TaxCalculationService.calculateFairSplit(updatedPartnerA, updatedPartnerB, updatedJointData);

//    console.log(updatedPartnerA, updatedPartnerB, updatedJointData);
    // Generiere PDF mit aktualisierten Daten
    const pdfBuffer = await PdfService.generateTaxCalculationPdf(
      updatedPartnerA,    // Korrigiert
      updatedPartnerB,    // Korrigiert
      updatedJointData,   // Korrigiert
      result,             // Berechnetes Ergebnis
      year,
      user?.id || 'unknown',
      undefined,
      user?.name
    );

    // Setze Response Headers für PDF-Download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="steuerberechnung-${year}-${user?.id || 'unknown'}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Sende PDF
    res.send(pdfBuffer);

    logger.info('PDF erfolgreich heruntergeladen', { userId: user?.id, year });
  } catch (error) {
    logger.error('Fehler beim PDF-Download:', error);

    // Strukturierte Fehlermeldung für den Client
    let clientError = 'PDF-Generierung fehlgeschlagen';
    let clientDetails = 'siehe error.log';

    res.status(500).json({
      success: false,
      error: clientError,
      details: clientDetails,
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId || 'unknown'
    });
  }
});

export { router as pdfRoutes };
