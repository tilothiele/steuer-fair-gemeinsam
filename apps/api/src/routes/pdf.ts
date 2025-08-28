import { Router } from 'express';
import { PdfService } from '../services/pdf-service';
import { TaxCalculationRequestSchema } from '@steuer-fair/shared';
import { TaxCalculator } from '@steuer-fair/shared';
import { UserRepository } from '../repositories/user-repository';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /api/pdf/download
 * Generiert eine PDF der Steuerberechnung
 */
router.post('/download', async (req, res) => {
  try {
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

    // Hole Benutzerdaten für PDF
    const user = await UserRepository.findByLoginId(userId);

    // Führe die echte Steuerberechnung durch
    const result = TaxCalculator.calculateFairSplit(partnerA, partnerB, jointData);

    // Generiere PDF
    const pdfBuffer = await PdfService.generateTaxCalculationPdf(
      partnerA,
      partnerB,
      jointData,
      result,
      year,
      userId,
      user?.steuernummer,
      user?.name
    );

    // Setze Response Headers für PDF-Download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="steuerberechnung-${year}-${userId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Sende PDF
    res.send(pdfBuffer);

    logger.info('PDF erfolgreich heruntergeladen', { userId, year });
  } catch (error) {
    logger.error('Fehler beim PDF-Download:', error);
    res.status(500).json({
      success: false,
      error: 'PDF-Generierung fehlgeschlagen'
    });
  }
});

export { router as pdfRoutes };
