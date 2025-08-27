import { z } from 'zod';

// Steuerklassen Schema
export const TaxClassSchema = z.enum(['1', '2', '3', '4', '5', '6']);
export type TaxClass = z.infer<typeof TaxClassSchema>;

// Steuerpartner Schema (festgesetzte Werte aus Steuerbescheid)
export const TaxPartnerSchema = z.object({
  id: z.enum(['A', 'B']),
  name: z.string().optional(),
  steuerId: z.string().optional(),
  // Eingabewerte für Steuerberechnung
  sek: z.number().min(0), // Steuerpflichtiges Einkommen
  taxClass: z.number().min(1).max(6), // Steuerklasse
  allowances: z.number().min(0), // Werbungskosten
  specialExpenses: z.number().min(0), // Sonderausgaben
  extraordinaryExpenses: z.number().min(0), // Außergewöhnliche Belastungen
  childAllowance: z.number().min(0), // Kinderfreibetrag
  // Berechnete Werte (werden automatisch ermittelt)
  fee: z.number().min(0), // Festgesetzte Einkommensteuer bei Einzelveranlagung
  fse: z.number().min(0), // Festgesetzter Soli bei Einzelveranlagung
  // Bereits gezahlte Beträge
  gl: z.number().min(0),  // Bereits gezahlte Lohn-/Einkommensteuer
  gve: z.number().min(0), // Bereits gezahlte Vorauszahlung für Einkommensteuer
  gs: z.number().min(0)   // Bereits gezahlter Soli
});

export interface TaxPartner {
  id: 'A' | 'B';
  name?: string;
  steuerId?: string;
  // Eingabewerte für Steuerberechnung
  sek: number; // Steuerpflichtiges Einkommen
  taxClass: number; // Steuerklasse
  allowances: number; // Werbungskosten
  specialExpenses: number; // Sonderausgaben
  extraordinaryExpenses: number; // Außergewöhnliche Belastungen
  childAllowance: number; // Kinderfreibetrag
  // Berechnete Werte (werden automatisch ermittelt)
  fee: number; // Festgesetzte Einkommensteuer bei Einzelveranlagung
  fse: number; // Festgesetzter Soli bei Einzelveranlagung
  // Bereits gezahlte Beträge
  gl: number;  // Bereits gezahlte Lohn-/Einkommensteuer
  gve: number; // Bereits gezahlte Vorauszahlung für Einkommensteuer
  gs: number   // Bereits gezahlter Soli
}

// Gemeinsame Werte Schema
export const JointTaxDataSchema = z.object({
  // Eingabewerte für gemeinsame Steuerberechnung
  gsek: z.number().min(0), // Gemeinsames steuerpflichtiges Einkommen
  // Berechnete Werte (werden automatisch ermittelt)
  gfe: z.number().min(0),  // Gemeinsame festgesetzte Einkommensteuer
  gfs: z.number().min(0)   // Gemeinsamer festgesetzter Soli
});

export interface JointTaxData {
  // Eingabewerte für gemeinsame Steuerberechnung
  gsek: number; // Gemeinsames steuerpflichtiges Einkommen
  // Berechnete Werte (werden automatisch ermittelt)
  gfe: number;  // Gemeinsame festgesetzte Einkommensteuer
  gfs: number   // Gemeinsamer festgesetzter Soli
}

// Steuerberechnungsergebnis Schema (korrekte Berechnung)
export const TaxCalculationResultSchema = z.object({
  plausibilityCheck: z.boolean(),
  plausibilityError: z.string().optional(),
  // Berechnete Faktoren
  factorA: z.number(),
  factorB: z.number(),
  // Gemeinsame zu zahlende Steuer
  gzz: z.number(), // GFE + GFS
  // Ergebnisse für jeden Partner
  partnerA: z.object({
    hätteZahlenMüssen: z.number(), // FEE + FSE
    mussNunZahlen: z.number(),     // FaktorA * GZZ
    hatGezahlt: z.number(),        // GL + GVE + GS
    differenz: z.number()          // MNZ - HG
  }),
  partnerB: z.object({
    hätteZahlenMüssen: z.number(), // FEE + FSE
    mussNunZahlen: z.number(),     // FaktorB * GZZ
    hatGezahlt: z.number(),        // GL + GVE + GS
    differenz: z.number()          // MNZ - HG
  })
});

export interface TaxCalculationResult {
  plausibilityCheck: boolean;
  plausibilityError?: string;
  // Berechnete Faktoren
  factorA: number;
  factorB: number;
  // Gemeinsame zu zahlende Steuer
  gzz: number; // GFE + GFS
  // Ergebnisse für jeden Partner
  partnerA: {
    hätteZahlenMüssen: number; // FEE + FSE
    mussNunZahlen: number;     // FaktorA * GZZ
    hatGezahlt: number;        // GL + GVE + GS
    differenz: number;         // MNZ - HG
  };
  partnerB: {
    hätteZahlenMüssen: number; // FEE + FSE
    mussNunZahlen: number;     // FaktorB * GZZ
    hatGezahlt: number;        // GL + GVE + GS
    differenz: number;         // MNZ - HG
  };
}

// User Management
export const UserSchema = z.object({
  id: z.string(),
  loginId: z.string().min(1),
  name: z.string().optional(),
  steuernummer: z.string().optional(),
  createdAt: z.date(),
  lastLogin: z.date()
});

export interface User {
  id: string;
  loginId: string;
  name?: string;
  steuernummer?: string;
  createdAt: Date;
  lastLogin: Date;
}

// Login Request/Response
export const LoginRequestSchema = z.object({
  loginId: z.string()
    .min(8, 'Login-ID muss mindestens 8 Zeichen lang sein')
    .refine((value) => {
      // Erlaubt alphanumerische Zeichen oder gültige E-Mail-Adressen
      const alphanumericPattern = /^[a-zA-Z0-9]{8,}$/;
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return alphanumericPattern.test(value) || emailPattern.test(value);
    }, 'Login-ID muss alphanumerisch (mindestens 8 Zeichen) oder eine gültige E-Mail-Adresse sein')
});

export interface LoginRequest {
  loginId: string;
}

export const LoginResponseSchema = z.object({
  success: z.boolean(),
  user: UserSchema.optional(),
  error: z.string().optional()
});

export interface LoginResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// API Request/Response Schemas
export const TaxCalculationRequestSchema = z.object({
  steuernummer: z.string().optional(),
  partnerA: TaxPartnerSchema,
  partnerB: TaxPartnerSchema,
  jointData: JointTaxDataSchema,
  year: z.number().int().min(2020).max(2030)
});

export interface TaxCalculationRequest {
  steuernummer?: string;
  partnerA: TaxPartner;
  partnerB: TaxPartner;
  jointData: JointTaxData;
  year: number;
}

export const TaxCalculationResponseSchema = z.object({
  success: z.boolean(),
  data: TaxCalculationResultSchema.optional(),
  error: z.string().optional()
});

export interface TaxCalculationResponse {
  success: boolean;
  data?: TaxCalculationResult;
  error?: string;
}

// Export alle Schemas
export const schemas = {
  TaxClass: TaxClassSchema,
  TaxPartner: TaxPartnerSchema,
  TaxCalculationResult: TaxCalculationResultSchema,
  TaxCalculationRequest: TaxCalculationRequestSchema,
  TaxCalculationResponse: TaxCalculationResponseSchema
};
