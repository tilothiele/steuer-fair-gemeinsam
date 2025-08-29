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
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      let browser: any = null;

      try {
        logger.info(`PDF-Generierung Versuch ${attempt}/${maxRetries}`, { userLoginId, year });

        // Debug: Chrome-Pfad loggen
        logger.info('Chrome-Konfiguration:', {
          CHROME_BIN: process.env.CHROME_BIN,
          CHROME_PATH: process.env.CHROME_PATH,
          attempt
        });

        browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-extensions',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-ipc-flooding-protection',
            '--disable-default-apps',
            '--disable-sync',
            '--disable-translate',
            '--hide-scrollbars',
            '--mute-audio',
            '--no-default-browser-check',
            '--disable-component-extensions-with-background-pages',
            '--disable-background-networking',
            '--disable-background-timer-throttling',
            '--disable-client-side-phishing-detection',
            '--disable-hang-monitor',
            '--disable-prompt-on-repost',
            '--disable-domain-reliability',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection',
            '--no-zygote',
            '--single-process'
          ],
          executablePath: process.env.CHROME_BIN || undefined,
          timeout: 30000,
          protocolTimeout: 30000
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

        logger.info('PDF erfolgreich generiert', { userLoginId, year, attempt });

        return Buffer.from(pdf);
          } catch (error) {
        // Browser sicher schließen
        if (browser) {
          try {
            await browser.close();
          } catch (closeError) {
            logger.warn('Fehler beim Schließen des Browsers:', closeError);
          }
        }

        lastError = error instanceof Error ? error : new Error('Unbekannter Fehler');

        // Detaillierte Fehleranalyse für bessere Diagnose
        let errorMessage = 'PDF-Generierung fehlgeschlagen';
        let errorDetails = '';

        if (error instanceof Error) {
          const errorStr = error.message.toLowerCase();

          // Chrome/Browser-spezifische Fehler
          if (errorStr.includes('chrome') || errorStr.includes('chromium') || errorStr.includes('browser')) {
            if (errorStr.includes('launch') || errorStr.includes('start')) {
              errorMessage = 'Chrome-Browser konnte nicht gestartet werden';
              errorDetails = 'Der PDF-Generator benötigt Chrome/Chromium, das möglicherweise nicht installiert ist oder nicht gestartet werden kann.';
            } else if (errorStr.includes('sandbox')) {
              errorMessage = 'Chrome-Sandbox-Probleme';
              errorDetails = 'Chrome kann nicht im Sandbox-Modus gestartet werden. Dies ist ein bekanntes Problem in Docker-Containern.';
            } else if (errorStr.includes('executable') || errorStr.includes('path')) {
              errorMessage = 'Chrome-Executable nicht gefunden';
              errorDetails = 'Der Chrome-Browser wurde nicht gefunden. Bitte stellen Sie sicher, dass Chrome/Chromium installiert ist.';
            }
          }
          // Memory/Resource-Fehler
          else if (errorStr.includes('memory') || errorStr.includes('out of memory')) {
            errorMessage = 'Nicht genügend Speicher für PDF-Generierung';
            errorDetails = 'Der Server hat nicht genügend Speicher, um die PDF zu generieren.';
          }
          // Timeout-Fehler
          else if (errorStr.includes('timeout') || errorStr.includes('timed out')) {
            errorMessage = 'PDF-Generierung hat zu lange gedauert';
            errorDetails = 'Die PDF-Generierung wurde wegen eines Timeouts abgebrochen.';
          }
          // Netzwerk-Fehler
          else if (errorStr.includes('network') || errorStr.includes('connection')) {
            errorMessage = 'Netzwerk-Fehler bei PDF-Generierung';
            errorDetails = 'Es gab ein Problem mit der Netzwerkverbindung während der PDF-Generierung.';
          }
          // Puppeteer Target-Fehler
          else if (errorStr.includes('target') || errorStr.includes('targetcloseerror')) {
            errorMessage = 'Chrome-Verbindung unerwartet geschlossen';
            errorDetails = 'Die Verbindung zu Chrome wurde unerwartet geschlossen. Dies kann bei hoher Serverlast oder Chrome-Problemen auftreten.';
          }
          // Allgemeine Puppeteer-Fehler
          else if (errorStr.includes('puppeteer') || errorStr.includes('page') || errorStr.includes('protocol error')) {
            errorMessage = 'Puppeteer-Fehler bei PDF-Generierung';
            errorDetails = 'Es gab ein Problem mit dem PDF-Generator (Puppeteer).';
          }
          // Unbekannte Fehler
          else {
            errorMessage = 'Unbekannter Fehler bei PDF-Generierung';
            errorDetails = `Unerwarteter Fehler: ${error.message}`;
          }
        }

        // Logging mit detaillierten Informationen
        logger.warn(`PDF-Generierung Versuch ${attempt}/${maxRetries} fehlgeschlagen:`, {
          error: error instanceof Error ? error.message : 'Unbekannter Fehler',
          stack: error instanceof Error ? error.stack : undefined,
          userLoginId,
          year,
          attempt,
          maxRetries,
          errorMessage,
          errorDetails
        });

        // Wenn es der letzte Versuch ist, Fehler werfen
        if (attempt === maxRetries) {
          // Erstelle strukturierte Fehlermeldung
          const structuredError = new Error(errorMessage);
          (structuredError as any).details = errorDetails;
          (structuredError as any).originalError = error instanceof Error ? error.message : 'Unbekannter Fehler';
          (structuredError as any).userLoginId = userLoginId;
          (structuredError as any).year = year;
          (structuredError as any).attempts = maxRetries;

          throw structuredError;
        }

        // Kurze Pause vor dem nächsten Versuch
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    // Sollte nie erreicht werden, aber für TypeScript
    throw lastError || new Error('PDF-Generierung fehlgeschlagen nach allen Versuchen');
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
                <span class="value">${formatCurrency(result.partnerA.haetteZahlenMuessen)}</span>
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
                <span class="value">${formatCurrency(result.partnerB.haetteZahlenMuessen)}</span>
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
