import axios from 'axios';
import { TaxPartner, TaxCalculationResult, JointTaxData } from '@steuer-fair/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Axios Instance konfigurieren
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor für Logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor für Error Handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    if (error.response) {
      // Server hat mit einem Fehler-Status geantwortet
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error(data.error || 'Ungültige Anfrage');
        case 401:
          throw new Error('Nicht autorisiert');
        case 403:
          throw new Error('Zugriff verweigert');
        case 404:
          throw new Error('Ressource nicht gefunden');
        case 429:
          throw new Error('Zu viele Anfragen. Bitte warten Sie einen Moment.');
        case 500:
          throw new Error('Server-Fehler. Bitte versuchen Sie es später erneut.');
        default:
          throw new Error(data.error || 'Ein unbekannter Fehler ist aufgetreten');
      }
    } else if (error.request) {
      // Anfrage wurde gesendet, aber keine Antwort erhalten
      throw new Error('Keine Verbindung zum Server. Bitte überprüfen Sie Ihre Internetverbindung.');
    } else {
      // Fehler beim Erstellen der Anfrage
      throw new Error('Fehler beim Erstellen der Anfrage');
    }
  }
);

export class TaxApiService {
  /**
   * Berechnet die Steueraufteilung
   */
  static async calculateTax(
    partnerA: TaxPartner,
    partnerB: TaxPartner,
    jointData: JointTaxData,
    year: number
  ): Promise<TaxCalculationResult> {
    try {
      const response = await apiClient.post('/api/tax/calculate', {
        partnerA,
        partnerB,
        jointData,
        year,
      });

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Berechnung fehlgeschlagen');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Ein unbekannter Fehler ist aufgetreten');
    }
  }

  /**
   * Ruft die aktuellen Steuertarife ab
   */
  static async getTaxBrackets() {
    try {
      const response = await apiClient.get('/api/tax/tax-brackets');
      return response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Steuertarife:', error);
      throw error;
    }
  }

  /**
   * Health Check für die API
   */
  static async healthCheck() {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health Check fehlgeschlagen:', error);
      throw error;
    }
  }
}

// Export der Axios-Instance für erweiterte Nutzung
export { apiClient };
