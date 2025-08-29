import { Router } from 'express';
import { PdfService } from '../services/pdf-service';
import { TaxCalculationRequestSchema } from '@steuer-fair/shared';
import { TaxCalculator } from '@steuer-fair/shared';
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

    // Führe die echte Steuerberechnung durch
    const result = TaxCalculator.calculateFairSplit(partnerA, partnerB, jointData);

    // Generiere PDF
    const pdfBuffer = await PdfService.generateTaxCalculationPdf(
      partnerA,
      partnerB,
      jointData,
      result,
      year,
      user?.id || 'unknown',
      undefined, // steuernummer
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
    let clientDetails = '';

    if (error instanceof Error) {
      console.log('error on pdf download', error);
      // Verwende die detaillierte Fehlermeldung aus dem PdfService
      if ((error as any).details) {
        clientError = error.message;
        clientDetails = (error as any).details;
      } else {
        // Fallback für andere Fehler
        const errorStr = error.message.toLowerCase();
        if (errorStr.includes('chrome') || errorStr.includes('browser')) {
          clientError = 'PDF-Generator nicht verfügbar';
          clientDetails = 'Der PDF-Generator ist derzeit nicht verfügbar. Bitte versuchen Sie es später erneut.';
        } else if (errorStr.includes('timeout')) {
          clientError = 'PDF-Generierung hat zu lange gedauert';
          clientDetails = 'Die PDF-Generierung wurde wegen eines Timeouts abgebrochen. Bitte versuchen Sie es erneut.';
        } else if (errorStr.includes('memory')) {
          clientError = 'Server überlastet';
          clientDetails = 'Der Server ist derzeit überlastet. Bitte versuchen Sie es später erneut.';
        } else {
          clientError = 'PDF-Generierung fehlgeschlagen';
          clientDetails = 'Es gab ein unerwartetes Problem bei der PDF-Generierung.';
        }
      }
    }

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
