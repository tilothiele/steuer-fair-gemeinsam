import puppeteer from 'puppeteer';
import { TaxCalculationResult, TaxPartner, JointTaxData } from '@steuer-fair/shared';
import { logger } from '../utils/logger';

export class PdfService {
  static async generateTaxCalculationPdf(
    partnerA: TaxPartner,
    partnerB: TaxPartner,
    jointData: JointTaxData,
    result: TaxCalculationResult,
    year: number,
    userLoginId: string,
    userSteuernummer?: string,
    userName?: string
  ): Promise<Buffer> {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      
      // HTML-Template für die PDF
      const html = this.generateHtmlTemplate(
        partnerA,
        partnerB,
        jointData,
        result,
        year,
        userLoginId,
        userSteuernummer,
        userName
      );

      await page.setContent(html, { waitUntil: 'networkidle0' });

      // PDF generieren
      const pdf = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        },
        printBackground: true
      });

      await browser.close();
      
      logger.info('PDF erfolgreich generiert', { userLoginId, year });
      
      return Buffer.from(pdf);
    } catch (error) {
      logger.error('Fehler bei PDF-Generierung:', error);
      throw new Error('PDF-Generierung fehlgeschlagen');
    }
  }

  private static generateHtmlTemplate(
    partnerA: TaxPartner,
    partnerB: TaxPartner,
    jointData: JointTaxData,
    result: TaxCalculationResult,
    year: number,
    userLoginId: string,
    userSteuernummer?: string,
    userName?: string
  ): string {
    const formatCurrency = (amount: number) => 
      new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);

    return `
      <!DOCTYPE html>
      <html lang="de">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Steuerberechnung ${year}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 24px;
          }
          .header p {
            margin: 5px 0;
            color: #666;
          }
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .section h2 {
            color: #2563eb;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .partner-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          .partner-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            background-color: #f9fafb;
          }
          .partner-card h3 {
            margin: 0 0 15px 0;
            color: #374151;
            font-size: 18px;
          }
          .data-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 5px 0;
            border-bottom: 1px solid #f3f4f6;
          }
          .data-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: 600;
            color: #374151;
          }
          .value {
            font-family: 'Courier New', monospace;
            color: #059669;
          }
          .result-section {
            background-color: #f0f9ff;
            border: 2px solid #0ea5e9;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .result-section h3 {
            color: #0c4a6e;
            margin: 0 0 15px 0;
          }
          .plausibility {
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 15px;
            font-weight: 600;
          }
          .plausibility.success {
            background-color: #dcfce7;
            color: #166534;
            border: 1px solid #22c55e;
          }
          .plausibility.error {
            background-color: #fef2f2;
            color: #991b1b;
            border: 1px solid #ef4444;
          }
          .calculation-results {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          .partner-result {
            background-color: white;
            border: 1px solid #e5e7eb;
            border-radius: 5px;
            padding: 15px;
          }
          .partner-result h4 {
            margin: 0 0 10px 0;
            color: #374151;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          @media print {
            body { margin: 0; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Steuer-Fair-Gemeinsam</h1>
          <p>Faire Aufteilung der Steuerlast für Ehepaare</p>
          <p><strong>Veranlagungsjahr:</strong> ${year}</p>
          ${userName ? `<p><strong>Name:</strong> ${userName}</p>` : ''}
          ${userSteuernummer ? `<p><strong>Steuernummer:</strong> ${userSteuernummer}</p>` : ''}
          <p><strong>Erstellt am:</strong> ${new Date().toLocaleDateString('de-DE')}</p>
        </div>

        <div class="section">
          <h2>Eingabedaten</h2>
          
          <div class="partner-grid">
            <div class="partner-card">
              <h3>Partner A${partnerA.name ? ` - ${partnerA.name}` : ''}</h3>
              <div class="data-row">
                <span class="label">Name:</span>
                <span class="value">${partnerA.name || 'Nicht angegeben'}</span>
              </div>
              <div class="data-row">
                <span class="label">Steuer-ID:</span>
                <span class="value">${partnerA.steuerId || 'Nicht angegeben'}</span>
              </div>
              <div class="data-row">
                <span class="label">Steuerpflichtiges Einkommen:</span>
                <span class="value">${formatCurrency(partnerA.sek)}</span>
              </div>
              <div class="data-row">
                <span class="label">Steuerklasse:</span>
                <span class="value">${partnerA.taxClass}</span>
              </div>

              <div class="data-row">
                <span class="label">Festgesetzte Einkommensteuer:</span>
                <span class="value">${formatCurrency(partnerA.fee)}</span>
              </div>
              <div class="data-row">
                <span class="label">Festgesetzter Soli:</span>
                <span class="value">${formatCurrency(partnerA.fse)}</span>
              </div>
              <div class="data-row">
                <span class="label">Bereits gezahlte Lohnsteuer:</span>
                <span class="value">${formatCurrency(partnerA.gl)}</span>
              </div>
              <div class="data-row">
                <span class="label">Bereits gezahlte Vorauszahlung:</span>
                <span class="value">${formatCurrency(partnerA.gve)}</span>
              </div>
              <div class="data-row">
                <span class="label">Bereits gezahlter Soli:</span>
                <span class="value">${formatCurrency(partnerA.gs)}</span>
              </div>
            </div>

            <div class="partner-card">
              <h3>Partner B${partnerB.name ? ` - ${partnerB.name}` : ''}</h3>
              <div class="data-row">
                <span class="label">Name:</span>
                <span class="value">${partnerB.name || 'Nicht angegeben'}</span>
              </div>
              <div class="data-row">
                <span class="label">Steuer-ID:</span>
                <span class="value">${partnerB.steuerId || 'Nicht angegeben'}</span>
              </div>
              <div class="data-row">
                <span class="label">Steuerpflichtiges Einkommen:</span>
                <span class="value">${formatCurrency(partnerB.sek)}</span>
              </div>
              <div class="data-row">
                <span class="label">Steuerklasse:</span>
                <span class="value">${partnerB.taxClass}</span>
              </div>

              <div class="data-row">
                <span class="label">Festgesetzte Einkommensteuer:</span>
                <span class="value">${formatCurrency(partnerB.fee)}</span>
              </div>
              <div class="data-row">
                <span class="label">Festgesetzter Soli:</span>
                <span class="value">${formatCurrency(partnerB.fse)}</span>
              </div>
              <div class="data-row">
                <span class="label">Bereits gezahlte Lohnsteuer:</span>
                <span class="value">${formatCurrency(partnerB.gl)}</span>
              </div>
              <div class="data-row">
                <span class="label">Bereits gezahlte Vorauszahlung:</span>
                <span class="value">${formatCurrency(partnerB.gve)}</span>
              </div>
              <div class="data-row">
                <span class="label">Bereits gezahlter Soli:</span>
                <span class="value">${formatCurrency(partnerB.gs)}</span>
              </div>
            </div>
          </div>

          <div class="partner-card">
            <h3>Gemeinsame Veranlagung</h3>
            <div class="data-row">
              <span class="label">Gemeinsames steuerpflichtiges Einkommen:</span>
              <span class="value">${formatCurrency(jointData.gsek)}</span>
            </div>
            <div class="data-row">
              <span class="label">Gemeinsame festgesetzte Einkommensteuer:</span>
              <span class="value">${formatCurrency(jointData.gfe)}</span>
            </div>
            <div class="data-row">
              <span class="label">Gemeinsamer festgesetzter Soli:</span>
              <span class="value">${formatCurrency(jointData.gfs)}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Berechnungsergebnis</h2>
          
          <div class="plausibility ${result.plausibilityCheck ? 'success' : 'error'}">
            ${result.plausibilityCheck 
              ? '✅ Plausibilitätsprüfung erfolgreich' 
              : `❌ Plausibilitätsprüfung fehlgeschlagen: ${result.plausibilityError || 'Unbekannter Fehler'}`
            }
          </div>

          <div class="result-section">
            <h3>Berechnete Faktoren</h3>
            <div class="data-row">
              <span class="label">Faktor A (Partner A):</span>
              <span class="value">${(result.factorA * 100).toFixed(2)}%</span>
            </div>
            <div class="data-row">
              <span class="label">Faktor B (Partner B):</span>
              <span class="value">${(result.factorB * 100).toFixed(2)}%</span>
            </div>
            <div class="data-row">
              <span class="label">Gemeinsame zu zahlende Steuer:</span>
              <span class="value">${formatCurrency(result.gzz)}</span>
            </div>
          </div>

          <div class="calculation-results">
            <div class="partner-result">
              <h4>Partner A - Aufteilung</h4>
              <div class="data-row">
                <span class="label">Hätte zahlen müssen:</span>
                <span class="value">${formatCurrency(result.partnerA.hätteZahlenMüssen)}</span>
              </div>
              <div class="data-row">
                <span class="label">Muss nun zahlen:</span>
                <span class="value">${formatCurrency(result.partnerA.mussNunZahlen)}</span>
              </div>
              <div class="data-row">
                <span class="label">Hat bereits gezahlt:</span>
                <span class="value">${formatCurrency(result.partnerA.hatGezahlt)}</span>
              </div>
              <div class="data-row">
                <span class="label">Differenz:</span>
                <span class="value">${formatCurrency(result.partnerA.differenz)}</span>
              </div>
            </div>

            <div class="partner-result">
              <h4>Partner B - Aufteilung</h4>
              <div class="data-row">
                <span class="label">Hätte zahlen müssen:</span>
                <span class="value">${formatCurrency(result.partnerB.hätteZahlenMüssen)}</span>
              </div>
              <div class="data-row">
                <span class="label">Muss nun zahlen:</span>
                <span class="value">${formatCurrency(result.partnerB.mussNunZahlen)}</span>
              </div>
              <div class="data-row">
                <span class="label">Hat bereits gezahlt:</span>
                <span class="value">${formatCurrency(result.partnerB.hatGezahlt)}</span>
              </div>
              <div class="data-row">
                <span class="label">Differenz:</span>
                <span class="value">${formatCurrency(result.partnerB.differenz)}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Dieses Dokument wurde automatisch von Steuer-Fair-Gemeinsam generiert.</p>
          <p>Die Berechnung basiert auf den eingegebenen Daten und den aktuellen Steuergesetzen.</p>
          <p>Für rechtliche Fragen wenden Sie sich bitte an einen Steuerberater.</p>
        </div>
      </body>
      </html>
    `;
  }
}
