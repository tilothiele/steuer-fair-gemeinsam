import axios from 'axios';
import { TaxPartner, TaxCalculationResult, JointTaxData, User } from '@steuer-fair/shared';

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
    year: number,
    userId: string
  ): Promise<TaxCalculationResult> {
    try {
      const response = await apiClient.post('/api/tax/calculate', {
        partnerA,
        partnerB,
        jointData,
        year,
        userId,
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
   * Speichert Steuerdaten
   */
  static async saveTaxData(
    partnerA: TaxPartner,
    partnerB: TaxPartner,
    jointData: JointTaxData,
    year: number,
    loginId: string
  ): Promise<void> {
    try {
      const response = await apiClient.post('/api/tax-data/save', {
        userId: loginId, // Verwende loginId als userId für die API
        partnerA,
        partnerB,
        jointData,
        year,
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Speichern fehlgeschlagen');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Ein unbekannter Fehler ist aufgetreten');
    }
  }

  /**
   * Lädt Steuerdaten
   */
  static async loadTaxData(loginId: string, year: number): Promise<{
    partnerA: TaxPartner;
    partnerB: TaxPartner;
    jointData: JointTaxData;
  } | null> {
    try {
      const response = await apiClient.get(`/api/tax-data/${loginId}/${year}`);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Laden fehlgeschlagen');
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

  /**
   * Lädt PDF der Steuerberechnung herunter
   */
  static async downloadPdf(
    partnerA: TaxPartner,
    partnerB: TaxPartner,
    jointData: JointTaxData,
    year: number,
    loginId: string
  ): Promise<void> {
    try {
      const response = await apiClient.post('/api/pdf/download', {
        userId: loginId,
        partnerA,
        partnerB,
        jointData,
        year,
      }, {
        responseType: 'blob'
      });

      // Erstelle Download-Link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `steuerberechnung-${year}-${loginId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF-Download fehlgeschlagen:', error);
      throw new Error('PDF-Download fehlgeschlagen');
    }
  }
}

export class ProfileApiService {
  /**
   * Aktualisiert das Benutzerprofil
   */
  static async updateProfile(loginId: string, name?: string, steuernummer?: string): Promise<User> {
    try {
      const response = await apiClient.put(`/api/profile/${loginId}`, {
        name,
        steuernummer,
      });

      if (response.data.success && response.data.user) {
        return response.data.user;
      } else {
        throw new Error(response.data.error || 'Profil-Update fehlgeschlagen');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Ein unbekannter Fehler ist aufgetreten');
    }
  }
}

// Export der Axios-Instance für erweiterte Nutzung
export { apiClient };
